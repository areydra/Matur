import * as Notifications from 'expo-notifications';
import { RelativePathString, router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

interface NotificationData {
    url?: string;
    chatId?: string;
    receiverId?: string;
    receiverName?: string;
    receiverAvatarUrl?: string;
}

import NotificationService from '@/src/services/NotificationService';

const useNotificationObserver = (isAppReady: boolean) => {
    const pathname = usePathname();
    const  [notificationData, setNotificationData] = useState<NotificationData>();

    useEffect(function initNotificationService() {
        NotificationService;
    }, []);

    useEffect(function init() {
        const response = Notifications.getLastNotificationResponse();

        // Handle open notification from background
        if (response?.notification) {
            setNotificationData(response.notification.request.content.data);
        }

        // Handle open notification from foreground
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            setNotificationData(response.notification.request.content.data);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(function handleNavigation() {
        if (notificationData && isAppReady && !pathname.includes('/chat')) {
            redirect(notificationData);
            setNotificationData(undefined);
        }
    }, [notificationData, isAppReady, pathname]);

    function redirect(notification: NotificationData) {
        const url = notification?.url;
        const chatId = notification?.chatId;
        const receiverId = notification?.receiverId;
        const receiverName = notification?.receiverName;
        const receiverAvatarUrl = notification?.receiverAvatarUrl;

        if (
            typeof url !== 'string' ||
            typeof chatId !== 'string' ||
            typeof receiverId !== 'string' ||
            typeof receiverName !== 'string' ||
            typeof receiverAvatarUrl !== 'string'
        ) {
            return
        }
        
        router.push({
            pathname: url as RelativePathString,
            params: {
                chatId,
                receiverId,
                receiverName,
                receiverAvatarUrl,
            }
        });
    }
}

export default useNotificationObserver;
