import { useGetAvatar, useUpdateProfile, useUploadAvatar } from '@/src/services/api/queryHooks';
import { useNavigationStore } from '@/src/store/navigationStore';
import { useUserStore } from '@/src/store/userStore';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

export default function useSetupAccount() {
    const user = useUserStore(state => state.user);
    const setActiveStack = useNavigationStore((state) => state.setActiveStack);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const setUserProfile = useUserStore(state => state.setUserProfile);
    const updateProfile = useUpdateProfile();
    const { mutateAsync: uploadAvatar} = useUploadAvatar();
    const { mutateAsync: getSpecificAvatar } = useGetAvatar();

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
            presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
        });

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

    const uploadImage = async(image: string): Promise<string> => {
        if (!user?.id) {
            throw new Error(`User not authenticated`);
        }

        let fileExt = 'jpg';
        let mimeType = 'image/jpeg';
        
        const uriParts = image.split('.');
        if (uriParts.length > 1) {
            const possibleExt = uriParts.pop()?.toLowerCase();
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
        
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;
                
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                const base64 = await FileSystem.readAsStringAsync(image, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                
                if (!base64 || base64.length === 0) {
                    throw new Error('Failed to read image file or empty file');
                }
                            
                const arrayBuffer = decode(base64);
                
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    throw new Error('Failed to convert image to ArrayBuffer or empty buffer');
                }
                            
                const { error: uploadError } = await uploadAvatar({ filePath, arrayBuffer, mimeType });
                
                if (uploadError) {
                    throw uploadError;
                }
                
                break;            
            } catch (error) {
                retryCount++;
                console.warn(`Upload attempt ${retryCount} failed:`, error);
                
                if (retryCount >= maxRetries) {
                    throw new Error(`Upload failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        return filePath;
    }

    const handleSubmit = async () => {
        if (!validateName(name)) {
            return;
        }
        
        if (!image) {
            alert('Please select a profile image');
            return;
        }

        if (!user) {
            throw new Error('User not authenticated');
        }
        
        setLoading(true);
        
        try {      
            const filePath = await uploadImage(image);
            const { data: avatarUrl } = await getSpecificAvatar(filePath)
            const { data, error: profileError } = await updateProfile.mutateAsync({        
                userId: user.id,
                name: name,
                avatarUrl: avatarUrl.publicUrl,
            });

            if (profileError) {
                throw profileError;
            }
            
            setUserProfile(data);
            setActiveStack('home');
        } catch (error) {
            handleErrorSubmit(error as Error)
        } finally {
            setLoading(false);
        }
    };

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

        if (value) {
            validateName(value);
        }
    };

    const handleErrorSubmit = (error: Error) => {
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
                        if (__DEV__) {
                            console.warn('User dismissed error dialog:', errorMessage);
                        }
                    }
                }
            ]
        );
    }

    return {
        name,
        nameError,
        loading,
        image,
        validateName,
        handleNameChange,
        handleImagePick,
        handleSubmit,
    }
}
