// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  CLEANUP_THRESHOLD: 0.8, // Clean up when cache reaches 80% of max size
};

export interface CacheMetadata {
  url: string;
  localPath: string;
  timestamp: number;
  size: number;
  ttl: number;
}

// Web storage implementation using localStorage for metadata
// Note: On web, we don't actually cache avatar files, we just use the URLs directly
class WebAvatarStorage {
  private storageKey = 'avatar-cache-metadata';

  private getStorage(): { [key: string]: CacheMetadata } {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setStorage(data: { [key: string]: CacheMetadata }): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save avatar cache metadata:', error);
    }
  }

  set(key: string, value: string): void {
    const storage = this.getStorage();
    const metadata: CacheMetadata = JSON.parse(value);
    storage[key] = metadata;
    this.setStorage(storage);
  }

  getString(key: string): string | undefined {
    const storage = this.getStorage();
    const metadata = storage[key];
    return metadata ? JSON.stringify(metadata) : undefined;
  }

  delete(key: string): void {
    const storage = this.getStorage();
    delete storage[key];
    this.setStorage(storage);
  }

  getAllKeys(): string[] {
    const storage = this.getStorage();
    return Object.keys(storage);
  }
}

export const avatarCacheStorage = new WebAvatarStorage();

// Cache directory placeholder for web (not used)
export const AVATAR_CACHE_DIR = '';

/**
 * Ensures the avatar cache directory exists (no-op on web)
 */
export const ensureCacheDirectory = async (): Promise<void> => {
  // No-op on web
};

/**
 * Generates a cache key from a URL
 */
export const getCacheKey = (url: string): string => {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Gets the local file path for a cached avatar (returns original URL on web)
 */
export const getCacheFilePath = (cacheKey: string): string => {
  // On web, we don't cache files locally, so we return an empty string
  // The avatar service should handle this by using the original URL
  return '';
};

/**
 * Stores cache metadata in localStorage
 */
export const setCacheMetadata = (cacheKey: string, metadata: CacheMetadata): void => {
  avatarCacheStorage.set(cacheKey, JSON.stringify(metadata));
};

/**
 * Retrieves cache metadata from localStorage
 */
export const getCacheMetadata = (cacheKey: string): CacheMetadata | null => {
  try {
    const data = avatarCacheStorage.getString(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to parse cache metadata:', error);
    return null;
  }
};

/**
 * Removes cache metadata from localStorage
 */
export const removeCacheMetadata = (cacheKey: string): void => {
  avatarCacheStorage.delete(cacheKey);
};

/**
 * Checks if a cached item is still valid based on TTL
 */
export const isCacheValid = (metadata: CacheMetadata): boolean => {
  const now = Date.now();
  return (now - metadata.timestamp) < metadata.ttl;
};

/**
 * Gets all cache keys from localStorage
 */
export const getAllCacheKeys = (): string[] => {
  return avatarCacheStorage.getAllKeys();
};

/**
 * Gets the total size of all cached files (returns 0 on web since we don't cache files)
 */
export const getCacheTotalSize = async (): Promise<number> => {
  return 0; // No files cached on web
};

/**
 * Removes expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  const keys = getAllCacheKeys();

  for (const key of keys) {
    const metadata = getCacheMetadata(key);
    if (!metadata || !isCacheValid(metadata)) {
      try {
        removeCacheMetadata(key);
      } catch (error) {
        console.warn('Failed to cleanup expired cache entry:', key, error);
      }
    }
  }
};

/**
 * Removes the least recently used cache entries to free up space (no-op on web)
 */
export const cleanupCacheBySize = async (): Promise<void> => {
  // No-op on web since we don't cache files
};

/**
 * Performs comprehensive cache cleanup
 */
export const performCacheCleanup = async (): Promise<void> => {
  try {
    await cleanupExpiredCache();
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
};

/**
 * Clears all cache data and files
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = getAllCacheKeys();
    keys.forEach(key => removeCacheMetadata(key));
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};