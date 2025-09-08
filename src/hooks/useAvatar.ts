import { useEffect, useState } from 'react';
import { loadAvatar } from '../services/avatarService';
import { AvatarLoadResult } from '../types';

export interface UseAvatarResult {
  uri: string | null;
  isLoading: boolean;
  isFromCache: boolean;
  error: string | null;
}

/**
 * Custom hook to load avatar with caching support
 * @param avatarUrl - The avatar URL to load
 * @returns Avatar loading state and result
 */
export const useAvatar = (avatarUrl: string | undefined): UseAvatarResult => {
  const [result, setResult] = useState<UseAvatarResult>({
    uri: null,
    isLoading: false,
    isFromCache: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadAvatarAsync = async () => {
      if (!avatarUrl) {
        if (isMounted) {
          setResult({
            uri: null,
            isLoading: false,
            isFromCache: false,
            error: null,
          });
        }
        return;
      }

      if (isMounted) {
        setResult(prev => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const avatarResult = await loadAvatar(avatarUrl);
        
        if (isMounted) {
          setResult({
            uri: avatarResult.uri || null,
            isLoading: false,
            isFromCache: avatarResult.isFromCache,
            error: avatarResult.error || null,
          });
        }
      } catch (error) {
        console.warn('useAvatar error:', error);
        
        if (isMounted) {
          setResult({
            uri: avatarUrl, // Fallback to original URL
            isLoading: false,
            isFromCache: false,
            error: error instanceof Error ? error.message : 'Failed to load avatar',
          });
        }
      }
    };

    loadAvatarAsync();

    return () => {
      isMounted = false;
    };
  }, [avatarUrl]);

  return result;
};