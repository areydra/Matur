# Avatar Service Documentation

## Overview

The Avatar Service provides robust image loading with authentication, local caching, and offline support for avatar images in the Matur chat application. It solves the common issue of accessing private Supabase Storage buckets by automatically handling authentication and implementing a sophisticated caching strategy.

## Problem Solved

Originally, avatar images were loaded directly from Supabase Storage URLs, which resulted in 403 Forbidden errors when buckets have Row Level Security (RLS) enabled. The Avatar Service addresses this by:

1. **Authentication**: Automatically creates signed URLs for private bucket access
2. **Local Caching**: Stores frequently accessed avatars locally for faster loading
3. **Offline Support**: Works seamlessly when the device is offline
4. **Performance**: Reduces bandwidth usage and improves user experience

## Architecture

```
Avatar Component
    ↓
useAvatar Hook
    ↓
Avatar Service
    ↓
[Cache Check] → [Local Storage] → [MMKV Metadata]
    ↓ (cache miss)
[Supabase Auth] → [Signed URL] → [Download] → [Cache Store]
```

## Core Components

### 1. Avatar Service (`src/services/avatarService.ts`)
The main service class that handles:
- Signed URL generation for Supabase Storage
- Image downloading and caching
- Cache validation and cleanup
- Background synchronization

### 2. Storage Utilities (`src/utils/avatarStorage.ts`)
Helper functions for:
- MMKV metadata storage
- File system operations
- Cache configuration and cleanup
- Directory management

### 3. useAvatar Hook (`src/hooks/useAvatar.ts`)
React hook that provides:
- Loading states
- Error handling
- Automatic re-fetching on URL changes
- Clean component integration

### 4. Enhanced Avatar Component (`src/components/Avatar/index.tsx`)
Updated component featuring:
- Loading indicators
- Error fallbacks
- Smooth transitions
- Cached image display

## Usage Examples

### Basic Avatar Display
```tsx
import Avatar from '@/src/components/Avatar';

const UserProfile = ({ user }) => (
  <Avatar 
    uri={user.avatar_url}
    name={user.name}
    size="large"
    showOnlineStatus
  />
);
```

### Using the Hook Directly
```tsx
import { useAvatar } from '@/src/hooks/useAvatar';

const CustomComponent = ({ avatarUrl }) => {
  const { uri, isLoading, isFromCache, error } = useAvatar(avatarUrl);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <Image source={{ uri }} />;
};
```

### Service Configuration
```tsx
import { avatarService } from '@/src/services/avatarService';

// Update configuration
avatarService.updateConfig({
  enableCache: true,
  ttl: 48 * 60 * 60 * 1000, // 48 hours
  enableBackgroundSync: false,
});

// Preload important avatars
await avatarService.preloadAvatar(userProfile.avatar_url);

// Clear specific avatar cache
await avatarService.invalidateAvatar(oldAvatarUrl);
```

## Caching Strategy

### Storage Locations
- **Images**: `${FileSystem.documentDirectory}avatar-cache/`
- **Metadata**: MMKV encrypted storage

### Cache Metadata
```typescript
interface CacheMetadata {
  url: string;        // Original avatar URL
  localPath: string;  // Local file system path
  timestamp: number;  // When cached
  size: number;       // File size in bytes
  ttl: number;        // Time to live in milliseconds
}
```

### Cleanup Strategy
1. **Expired Entry Cleanup**: Removes entries past their TTL
2. **Size-based Cleanup**: Removes oldest entries when cache exceeds limits
3. **Automatic Cleanup**: Runs on service initialization and periodically

### Configuration Options
```typescript
const CACHE_CONFIG = {
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_SIZE: 50 * 1024 * 1024,  // 50MB
  CLEANUP_THRESHOLD: 0.8,            // Clean when 80% full
};
```

## Authentication Flow

### Supabase Storage Integration
1. **URL Analysis**: Detects Supabase Storage URLs
2. **Session Check**: Verifies active user session
3. **Signed URL Creation**: Generates authenticated URL with 1-hour expiry
4. **Fallback Handling**: Uses original URL if signing fails

### RLS Policy Support
The service works with standard Supabase RLS policies:
```sql
-- Example policy for user-specific avatar access
create policy "Users can access their own avatars"
on storage.objects for select
using (auth.uid()::text = (storage.foldername(name))[1]);
```

## Error Handling

### Graceful Degradation
- **Network Errors**: Falls back to original URL
- **Auth Failures**: Attempts public URL access
- **Cache Corruption**: Re-downloads and re-caches
- **Storage Full**: Automatic cleanup and retry

### Error Types
- **Authentication Error**: Invalid or expired session
- **Network Error**: Connection or download failure
- **Storage Error**: Local file system issues
- **Validation Error**: Invalid URL format

## Performance Benefits

### Load Times
- **Cache Hit**: ~10-50ms (local file access)
- **Cache Miss**: ~500-2000ms (download + cache)
- **Subsequent Loads**: Instant (memory + cache)

### Bandwidth Savings
- Cached images: 0 bytes after first load
- Background sync: Only when needed
- Smart invalidation: Only updates when necessary

### Memory Usage
- Minimal memory footprint
- Lazy loading with cleanup
- MMKV for efficient metadata storage

## Monitoring and Debugging

### Development Logging
The service includes comprehensive logging:
- Cache hits/misses
- Download attempts and failures
- Authentication status
- Cleanup operations

### Production Monitoring
Consider adding analytics for:
- Cache hit rate
- Download success rate
- Storage usage
- Error frequency

## Migration Guide

### From Direct URLs
```typescript
// Before
<Image source={{ uri: avatarUrl }} />

// After
<Avatar uri={avatarUrl} name={userName} />
```

### Existing Cached Data
The service automatically handles cache migration and validates existing cached data.

## Best Practices

1. **Preload Important Avatars**: Use `preloadAvatar()` for critical user images
2. **Handle Loading States**: Always show loading indicators for better UX
3. **Error Boundaries**: Wrap avatar components in error boundaries
4. **Cache Invalidation**: Clear cache when users update their avatars
5. **Testing**: Test with various network conditions and storage states

## Troubleshooting

### Common Issues

**403 Forbidden Errors**
- Verify RLS policies in Supabase
- Check user authentication status
- Ensure proper bucket permissions

**Slow Loading**
- Check cache configuration
- Verify network conditions
- Monitor cache hit rates

**Storage Issues**
- Check available device storage
- Verify cache directory permissions
- Review cleanup threshold settings

**Memory Leaks**
- Ensure proper component unmounting
- Check for retained promises
- Monitor MMKV memory usage

## Future Enhancements

1. **Image Compression**: Automatic image optimization
2. **CDN Integration**: Support for multiple storage providers
3. **Batch Operations**: Bulk avatar preloading
4. **Analytics**: Detailed usage metrics
5. **Progressive Loading**: Low-res to high-res transitions