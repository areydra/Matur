import {
    GET_AVATAR,
    GET_CHAT_SUMMARY,
    GET_PROFILE,
    GET_SPECIFIC_PROFILE,
    LOGIN_WITH_GOOGLE_TOKEN,
    POST_CHAT_SUMMARY,
    UPDATE_PROFILE,
    UPLOAD_AVATAR,
} from '@/src/constants/queryKeys';
import { supabase } from '@/src/database/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';

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

export const useGetProfile = () => {
    return useMutation({
        mutationKey: [GET_PROFILE],
        mutationFn: async ({ userId }: { userId: string; }) => {
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

export const useGetChatSummary = () => {
    return useQuery({
        queryKey: [GET_CHAT_SUMMARY],
        queryFn: async() => {
            const { data } = await supabase.rpc('get_chat_summary');
            return data;
        },
    })
}

export const useGetSpecificProfile = () => {
    return useMutation({
        mutationKey: [GET_SPECIFIC_PROFILE],
        mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
            const response = await supabase.from('profiles').select(`*`).ilike('name', `%${name}%`).neq('id', userId);
            return response;
        },
    })
}

export const usePostChatSummary = () => {
    return useMutation({
        mutationKey: [POST_CHAT_SUMMARY],
        mutationFn: async (params: { owner_id: string; participant_id: string; }) => {
            const { data } = await supabase.rpc('create_new_chat_summary_dm', {
                p_owner_id: params.owner_id,
                p_participant_id: params.participant_id
            });
            return data;
        },
    })
}
