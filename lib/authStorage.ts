import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance for auth storage
const encryptionKey = process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error(
    'Missing MMKV encryption key. Please add EXPO_PUBLIC_MMKV_ENCRYPTION_KEY to your .env file.'
  );
}

const authStorage = new MMKV({
  id: 'auth-storage',
  encryptionKey, // From environment variable
});

export const getItem = async (key: string) => {
    const value = authStorage.getString(key);
    return value;
};

export const setItem = async (key: string, value: string) => {
    authStorage.set(key, value);
    return value;
};

export const removeItem = async (key: string) => {
    authStorage.delete(key);
    return true;
}