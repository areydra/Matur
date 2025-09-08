import { supabase } from '@/lib/supabase';
import { useNavigationStore } from '@/src/store/navigationStore';
import { useUserStore } from '@/src/store/userStore';
import { colors, spacing, typography } from '@/src/utils/theme';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ColorValue, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupAccountScreen() {
  const setActiveStack = useNavigationStore((state) => state.setActiveStack);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setUserProfile = useUserStore(state => state.setUserProfile);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value) validateName(value);
  };

  const handleImagePick = async () => {    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      exif: false,
      base64: false,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC, // CRITICAL: Fix for iOS crashes, especially iPhone 15 Pro + Face ID
    });
    
    await handlePickerResult(result);
  };

  // Common picker result handler
  const handlePickerResult = async (result: any) => {    
    if (!result || result.canceled) {
      return;
    }
    
    if (!result.assets || result.assets.length === 0) {
      throw new Error('No image was selected');
    }
    
    const asset = result.assets[0];
    
    if (!asset.uri) {
      throw new Error('Invalid image selected');
    }
    
    setImage(asset.uri);
  };

  const handleSubmit = async () => {
    // Validate name
    if (!validateName(name)) return;
    
    // Validate image
    if (!image) {
      alert('Please select a profile image');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Upload image to Supabase Storage using ArrayBuffer method
      // Extract file extension with fallback for iOS URIs
      let fileExt = 'jpg'; // Default fallback
      let mimeType = 'image/jpeg'; // Default MIME type
      
      try {
        const uriParts = image.split('.');
        if (uriParts.length > 1) {
          const possibleExt = uriParts.pop()?.toLowerCase();
          // Validate that it's a valid image extension and set MIME type
          if (possibleExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(possibleExt)) {
            fileExt = possibleExt;
            switch (possibleExt) {
              case 'png':
                mimeType = 'image/png';
                break;
              case 'gif':
                mimeType = 'image/gif';
                break;
              case 'webp':
                mimeType = 'image/webp';
                break;
              default:
                mimeType = 'image/jpeg';
            }
          }
        }
      } catch (error) {
        console.warn('Could not extract file extension, using default:', error);
      }
      
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
            
      // Convert image URI to ArrayBuffer using Expo FileSystem      
      let retryCount = 0;
      const maxRetries = Platform.OS === 'ios' ? 3 : 1; // iOS often fails on first attempt
      
      while (retryCount < maxRetries) {
        try {
          // Read file as base64 string
          const base64 = await FileSystem.readAsStringAsync(image, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          if (!base64 || base64.length === 0) {
            throw new Error('Failed to read image file or empty file');
          }
                    
          // Convert base64 to ArrayBuffer
          const arrayBuffer = decode(base64);
          
          if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            throw new Error('Failed to convert image to ArrayBuffer or empty buffer');
          }
                    
          // Upload to Supabase Storage with proper content type
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, arrayBuffer, {
              contentType: mimeType,
              upsert: true
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Success - break out of retry loop
          break;
          
        } catch (error) {
          retryCount++;
          console.warn(`Upload attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            // Final attempt failed
            throw new Error(`Upload failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Save user profile data to database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name,
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        });
        
      if (profileError) {
        throw profileError;
      }
      
      const {data} = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(data);
      // Profile saved successfully - now navigate
      setActiveStack('home');
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // More specific error handling with detailed logging
      let errorMessage = 'Unknown error occurred';
      let userFriendlyMessage = 'Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          platform: Platform.OS,
          imageUri: image
        });
        
        // Provide user-friendly messages based on error type
        if (errorMessage.includes('Network request failed')) {
          userFriendlyMessage = 'Please check your internet connection and try again.';
        } else if (errorMessage.includes('Failed to read image')) {
          userFriendlyMessage = 'There was an issue with the selected image. Please try selecting a different image.';
        } else if (errorMessage.includes('Upload failed after')) {
          userFriendlyMessage = 'Upload failed after multiple attempts. Please check your connection and try again.';
        } else if (errorMessage.includes('User not authenticated')) {
          userFriendlyMessage = 'Please log in again and try again.';
        } else if (errorMessage.includes('Invalid image')) {
          userFriendlyMessage = 'Please select a valid image file.';
        }
      }
      
      Alert.alert(
        'Error Saving Profile', 
        `${userFriendlyMessage}${__DEV__ ? `\n\nDev Info: ${errorMessage}` : ''}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Log error for debugging in development
              if (__DEV__) {
                console.warn('User dismissed error dialog:', errorMessage);
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>      
      {/* Header */}
      <Text style={styles.title}>Setup Account</Text>
      <Text style={styles.subtitle}>Fill your account information below</Text>
      
      {/* Profile Image Picker */}
      <TouchableOpacity 
        style={styles.imagePickerContainer}
        onPress={handleImagePick}
      >
        {image ? (
          <Image 
            source={{ uri: image }}
            style={styles.profileImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.cameraIconContainer}>
            <Image 
              source={require('@/assets/images/camera-icon.svg')}
              style={styles.cameraIcon}
              contentFit="contain"
            />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          placeholder="Enter your name"
          placeholderTextColor="#666666"
          value={name}
          onChangeText={handleNameChange}
          onBlur={() => validateName(name)}
        />
        {nameError && (
          <Text style={styles.errorText}>{nameError}</Text>
        )}
      </View>
      
      {/* Submit Button */}
       <TouchableOpacity
        style={styles.submitButtonContainer}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={loading}
      >
        <LinearGradient
          colors={colors.gradient.button as [ColorValue, ColorValue]}
          style={styles.submitButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>✓</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dark purple background
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
    color: colors.blueLight,
    marginBottom: spacing.xxl,
  },
  imagePickerContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 40,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#2D2A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 40,
    height: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    lineHeight: 20,
    backgroundColor: colors.purpleSoft,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.white,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.red,
  },
  errorText: {
    ...typography.sm,
    color: colors.red,
    marginTop: 4,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 24,
  },
  submitButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5D5FEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});