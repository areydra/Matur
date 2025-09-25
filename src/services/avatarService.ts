import { supabase } from '@/src/database/supabase';
import * as FileSystem from 'expo-file-system';
import {
  CACHE_CONFIG,
  CacheMetadata,
  ensureCacheDirectory,
  getCacheFilePath,
  getCacheKey,
  getCacheMetadata,
  isCacheValid,
  performCacheCleanup,
  removeCacheMetadata,
  setCacheMetadata
} from '../utils/avatarStorage';

export interface AvatarLoadResult {
  uri: string;
  isFromCache: boolean;
  error?: string;
}

export interface AvatarServiceConfig {
  enableCache: boolean;
  ttl: number;
  enableBackgroundSync: boolean;
}

class AvatarService {
  private config: AvatarServiceConfig;
  private loadingPromises: Map<string, Promise<AvatarLoadResult>> = new Map();

  constructor(config?: Partial<AvatarServiceConfig>) {
    this.config = {
      enableCache: true,
      ttl: CACHE_CONFIG.DEFAULT_TTL,
      enableBackgroundSync: true,
      ...config,
    };

    // Ensure cache directory exists on initialization
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      await ensureCacheDirectory();
      // Perform background cleanup on initialization
      if (this.config.enableCache) {
        setTimeout(() => performCacheCleanup(), 1000); // Delay to avoid blocking UI
      }
    } catch (error) {
      console.warn('Failed to initialize avatar cache:', error);
    }
  }

  /**
   * Gets a signed URL for private Supabase storage buckets
   */
  private async getSignedUrl(avatarUrl: string): Promise<string | null> {
    try {
      // Check if it's already a Supabase storage URL
      if (!avatarUrl.includes('supabase.co/storage/v1/object/public/')) {
        return avatarUrl; // Return as-is if it's not a Supabase URL
      }

      // Extract the file path from the public URL
      const urlParts = avatarUrl.split('/storage/v1/object/public/');
      if (urlParts.length !== 2) {
        console.warn('Invalid Supabase storage URL format:', avatarUrl);
        return avatarUrl;
      }

      const [bucketAndPath] = urlParts[1].split('/');
      const filePath = urlParts[1].substring(bucketAndPath.length + 1);

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn('No active session, using public URL:', sessionError?.message);
        return avatarUrl; // Fall back to public URL
      }

      // Create signed URL for private bucket access
      const { data, error } = await supabase.storage
        .from(bucketAndPath)
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

      if (error) {
        console.warn('Failed to create signed URL, using original:', error.message);
        return avatarUrl; // Fall back to original URL
      }

      return data.signedUrl;
    } catch (error) {
      console.warn('Error creating signed URL:', error);
      return avatarUrl; // Fall back to original URL
    }
  }

  /**
   * Downloads and caches an avatar image
   */
  private async downloadAndCache(url: string, cacheKey: string): Promise<string> {
    const localPath = getCacheFilePath(cacheKey);

    try {
      // Get signed URL for authentication if needed
      const signedUrl = await this.getSignedUrl(url);
      if (!signedUrl) {
        throw new Error('Failed to get signed URL');
      }

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(signedUrl, localPath);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }

      // Get file info for metadata
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        throw new Error('Downloaded file does not exist');
      }

      // Store cache metadata
      const metadata: CacheMetadata = {
        url,
        localPath,
        timestamp: Date.now(),
        size: fileInfo.size || 0,
        ttl: this.config.ttl,
      };

      setCacheMetadata(cacheKey, metadata);
      
      return localPath;
    } catch (error) {
      // Clean up failed download
      try {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(localPath);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup failed download:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Loads an avatar image with caching support
   */
  async loadAvatar(avatarUrl: string | undefined): Promise<AvatarLoadResult> {
    // Handle empty or invalid URLs
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return {
        uri: '',
        isFromCache: false,
        error: 'Invalid avatar URL',
      };
    }

    // Check if we're already loading this avatar
    const existingPromise = this.loadingPromises.get(avatarUrl);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new loading promise
    const loadPromise = this.performAvatarLoad(avatarUrl);
    this.loadingPromises.set(avatarUrl, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      // Clean up the promise from the map
      this.loadingPromises.delete(avatarUrl);
    }
  }

  private async performAvatarLoad(avatarUrl: string): Promise<AvatarLoadResult> {
    const cacheKey = getCacheKey(avatarUrl);

    // If caching is disabled, directly return the signed URL
    if (!this.config.enableCache) {
      try {
        const signedUrl = await this.getSignedUrl(avatarUrl);
        return {
          uri: signedUrl || avatarUrl,
          isFromCache: false,
        };
      } catch (error) {
        return {
          uri: avatarUrl,
          isFromCache: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    try {
      // Check if we have a cached version
      const metadata = getCacheMetadata(cacheKey);
      
      if (metadata && isCacheValid(metadata)) {
        // Verify the cached file still exists
        const fileInfo = await FileSystem.getInfoAsync(metadata.localPath);
        if (fileInfo.exists) {
          // Optional: Background sync for fresh content
          if (this.config.enableBackgroundSync) {
            setTimeout(() => this.backgroundSync(avatarUrl), 100);
          }
          
          return {
            uri: metadata.localPath,
            isFromCache: true,
          };
        } else {
          // File was deleted, remove stale metadata
          removeCacheMetadata(cacheKey);
        }
      }

      // Cache miss or invalid cache - download and cache
      const localPath = await this.downloadAndCache(avatarUrl, cacheKey);
      
      return {
        uri: localPath,
        isFromCache: false,
      };
    } catch (error) {
      // On error, try to return a signed URL without caching
      console.warn('Avatar cache failed, falling back to direct URL:', error);
      
      try {
        const signedUrl = await this.getSignedUrl(avatarUrl);
        return {
          uri: signedUrl || avatarUrl,
          isFromCache: false,
          error: error instanceof Error ? error.message : 'Cache failed',
        };
      } catch (signedUrlError) {
        return {
          uri: avatarUrl,
          isFromCache: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  /**
   * Background synchronization to refresh cached avatars
   */
  private async backgroundSync(avatarUrl: string): Promise<void> {
    try {
      const cacheKey = getCacheKey(avatarUrl);
      await this.downloadAndCache(avatarUrl, cacheKey);
    } catch (error) {
      // Silent fail for background sync
      console.debug('Background sync failed for avatar:', avatarUrl, error);
    }
  }

  /**
   * Preloads an avatar for better performance
   */
  async preloadAvatar(avatarUrl: string): Promise<void> {
    try {
      await this.loadAvatar(avatarUrl);
    } catch (error) {
      console.debug('Avatar preload failed:', avatarUrl, error);
    }
  }

  /**
   * Invalidates cache for a specific avatar URL
   */
  async invalidateAvatar(avatarUrl: string): Promise<void> {
    const cacheKey = getCacheKey(avatarUrl);
    const metadata = getCacheMetadata(cacheKey);
    
    if (metadata) {
      try {
        // Remove the file
        const fileInfo = await FileSystem.getInfoAsync(metadata.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(metadata.localPath);
        }
        // Remove metadata
        removeCacheMetadata(cacheKey);
      } catch (error) {
        console.warn('Failed to invalidate avatar cache:', error);
      }
    }
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<AvatarServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): AvatarServiceConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const avatarService = new AvatarService();

// Export convenience functions
export const loadAvatar = (avatarUrl: string | undefined) => avatarService.loadAvatar(avatarUrl);
export const preloadAvatar = (avatarUrl: string) => avatarService.preloadAvatar(avatarUrl);
export const invalidateAvatar = (avatarUrl: string) => avatarService.invalidateAvatar(avatarUrl);