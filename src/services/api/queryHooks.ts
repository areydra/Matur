import {
    GET_AVATAR,
    GET_CHAT_SUMMARY,
    GET_EXPO_PUSH_NOTIFICATION,
    GET_PROFILE,
    GET_SPECIFIC_PROFILE,
    LOGIN_WITH_GOOGLE_TOKEN,
    POST_CHAT_SUMMARY,
    POST_EXPO_PUSH_NOTIFICATION,
    PUT_MARK_AS_READ_MESSAGES,
    SEND_PUSH_NOTIFICATION,
    UPDATE_PROFILE,
    UPLOAD_AVATAR,
} from '@/src/constants/queryKeys';
import { supabase } from '@/src/database/supabase';
import { IPushNotificationPayload } from '@/src/hooks/useExpoPushNotification';
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
            const { data } = await supabase.rpc('get_chat_summary').order('last_message_created_at', { ascending: false });
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

export const usePutMarkAsReadMessages = () => {
    return useMutation({
        mutationKey: [PUT_MARK_AS_READ_MESSAGES],
        mutationFn: async ({
            chatId,
            ownerId,
        } : {
            chatId: string;
            ownerId: string;
        }) => {
            const response = await supabase.from('chat_summary').update({ count_unread_messages: 0 }).eq('owner_id', ownerId).eq('chat_id', chatId).select()
            return response;
        },
    })
}

export const usePostExpoPushNotification = () => {
    return useMutation({
        mutationKey: [POST_EXPO_PUSH_NOTIFICATION],
        mutationFn: async ({
            userId,
            expoPushNotification,
        } : {
            userId: string;
            expoPushNotification: string;
        }) => {
            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('expo_push_notification', expoPushNotification)
                .single();

            if (!existing) {
                await supabase.from('notifications').insert({ user_id: userId, expo_push_notification: expoPushNotification });
                return true;
            }

            return false;
        },
    })
}

export const useGetExpoPushNotification = () => {
    return useMutation({
        mutationKey: [GET_EXPO_PUSH_NOTIFICATION],
        mutationFn: async ({ userId }: { userId: string; }) => {
            if (!userId) {
                return null;
            }

            const { data } = await supabase.from('notifications').select('*').eq('user_id', userId);
            return data;
        },
    })
}

export const useSendPushNotification = () => {
    return useMutation({
        mutationKey: [SEND_PUSH_NOTIFICATION],
        mutationFn: async (message: IPushNotificationPayload) => {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });
            return response;
        },
    })
}
