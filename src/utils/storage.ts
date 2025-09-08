import * as FileSystem from 'expo-file-system';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance for avatar cache metadata
const encryptionKey = process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error(
    'Missing MMKV encryption key. Please add EXPO_PUBLIC_MMKV_ENCRYPTION_KEY to your .env file.'
  );
}

export const avatarCacheStorage = new MMKV({
  id: 'avatar-cache',
  encryptionKey,
});

// Cache directory for storing avatar images
export const AVATAR_CACHE_DIR = `${FileSystem.documentDirectory}avatar-cache/`;

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

/**
 * Ensures the avatar cache directory exists
 */
export const ensureCacheDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(AVATAR_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AVATAR_CACHE_DIR, { 
      intermediates: true 
    });
  }
};

/**
 * Generates a cache key from a URL
 */
export const getCacheKey = (url: string): string => {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Gets the local file path for a cached avatar
 */
export const getCacheFilePath = (cacheKey: string): string => {
  return `${AVATAR_CACHE_DIR}${cacheKey}.jpg`;
};

/**
 * Stores cache metadata in MMKV
 */
export const setCacheMetadata = (cacheKey: string, metadata: CacheMetadata): void => {
  avatarCacheStorage.set(cacheKey, JSON.stringify(metadata));
};

/**
 * Retrieves cache metadata from MMKV
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
 * Removes cache metadata from MMKV
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
 * Gets all cache keys from MMKV
 */
export const getAllCacheKeys = (): string[] => {
  return avatarCacheStorage.getAllKeys();
};

/**
 * Gets the total size of all cached files
 */
export const getCacheTotalSize = async (): Promise<number> => {
  const keys = getAllCacheKeys();
  let totalSize = 0;

  for (const key of keys) {
    const metadata = getCacheMetadata(key);
    if (metadata) {
      totalSize += metadata.size;
    }
  }

  return totalSize;
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
        // Remove the file
        const fileInfo = await FileSystem.getInfoAsync(metadata?.localPath || '');
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(metadata!.localPath);
        }
        // Remove metadata
        removeCacheMetadata(key);
      } catch (error) {
        console.warn('Failed to cleanup expired cache entry:', key, error);
      }
    }
  }
};

/**
 * Removes the least recently used cache entries to free up space
 */
export const cleanupCacheBySize = async (): Promise<void> => {
  const keys = getAllCacheKeys();
  const metadataEntries = keys
    .map(key => ({ key, metadata: getCacheMetadata(key) }))
    .filter(entry => entry.metadata !== null)
    .sort((a, b) => a.metadata!.timestamp - b.metadata!.timestamp); // Sort by timestamp (oldest first)

  const currentSize = await getCacheTotalSize();
  const targetSize = CACHE_CONFIG.MAX_CACHE_SIZE * CACHE_CONFIG.CLEANUP_THRESHOLD;

  let sizeToFree = currentSize - targetSize;

  for (const { key, metadata } of metadataEntries) {
    if (sizeToFree <= 0) break;
    
    try {
      // Remove the file
      const fileInfo = await FileSystem.getInfoAsync(metadata!.localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(metadata!.localPath);
      }
      // Remove metadata
      removeCacheMetadata(key);
      sizeToFree -= metadata!.size;
    } catch (error) {
      console.warn('Failed to cleanup cache entry by size:', key, error);
    }
  }
};

/**
 * Performs comprehensive cache cleanup
 */
export const performCacheCleanup = async (): Promise<void> => {
  try {
    // First, remove expired entries
    await cleanupExpiredCache();
    
    // Then, check if we need to free up space
    const currentSize = await getCacheTotalSize();
    if (currentSize > CACHE_CONFIG.MAX_CACHE_SIZE * CACHE_CONFIG.CLEANUP_THRESHOLD) {
      await cleanupCacheBySize();
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
};

/**
 * Clears all cache data and files
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    // Remove all files
    const dirInfo = await FileSystem.getInfoAsync(AVATAR_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(AVATAR_CACHE_DIR);
    }
    
    // Clear all metadata
    const keys = getAllCacheKeys();
    keys.forEach(key => removeCacheMetadata(key));
    
    // Recreate directory
    await ensureCacheDirectory();
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};