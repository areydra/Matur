import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import {
    GET_AVATAR,
    GET_PROFILE,
    LOGIN_WITH_GOOGLE_TOKEN,
    UPDATE_PROFILE,
    UPLOAD_AVATAR,
} from './queryKeys';

export const useLoginWithGoogleToken = () => {
    return useMutation({
        mutationKey: [LOGIN_WITH_GOOGLE_TOKEN],
        mutationFn: async (googleToken: string) => {
            const response = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: googleToken,
            });

            return response;
        }
    })
}

export const useGetProfile = (userId?: string) => {
    return useQuery({
        queryKey: [GET_PROFILE, userId],
        queryFn: async() => {
            if (!userId) {
                return null;
            }

            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
            return data;
        },
    })
}

export const useUpdateProfile = () => {
    return useMutation({
        mutationKey: [UPDATE_PROFILE],
        mutationFn: async ({
            userId,
            name,
            avatarUrl,
        } : {
            userId: string;
            name: string;
            avatarUrl: string;
        }) => {
            const response = await supabase.from('profiles').upsert({
                id: userId,
                name: name,
                avatar_url: avatarUrl,
            });
            return response;
        },
    })
}

export const useGetAvatar = () => {
    return useMutation({
        mutationKey: [GET_AVATAR],
        mutationFn: async (filePath: string) => {
            const response = await supabase.storage.from('avatars').getPublicUrl(filePath);
            return response;
        },
    })
}

export const useUploadAvatar = () => {
    return useMutation({
        mutationKey: [UPLOAD_AVATAR],
        mutationFn: async ({
            filePath,
            arrayBuffer,
            mimeType,
        } : {
            filePath: string;
            arrayBuffer: ArrayBuffer;
            mimeType: string;
        }) => {
            const response = await supabase.storage.from('avatars').upload(filePath, arrayBuffer, {
                contentType: mimeType,
                upsert: true
            });
            return response;
        },
    })
}