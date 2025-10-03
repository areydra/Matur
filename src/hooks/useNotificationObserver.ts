import * as Notifications from 'expo-notifications';
import { RelativePathString, router, useFocusEffect, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

interface NotificationData {
    url?: string;
    chatId?: string;
    receiverId?: string;
    receiverName?: string;
    receiverAvatarUrl?: string;
}

import { AppState } from 'react-native';

const useNotificationObserver = (isAppReady: boolean) => {
    const pathname = usePathname();
    const  [notificationData, setNotificationData] = useState<NotificationData>();
    const appState = useRef(AppState.currentState);

    useFocusEffect(
        function handleNotification(){
            Notifications.setNotificationHandler({
                handleNotification: async (notification): Promise<Notifications.NotificationBehavior> => {
                    const currentAppState = appState.current;
                    const receiverId = notification.request.content.data?.receiverId;

                    const shouldShow = !(pathname === `/chat/${receiverId}` && currentAppState === 'active');
                    return {
                        shouldShowAlert: shouldShow,
                        shouldPlaySound: shouldShow,
                        shouldSetBadge: shouldShow,
                        shouldShowBanner: shouldShow,
                        shouldShowList: shouldShow,
                    };
                },
            });
        }
    );

    useEffect(function init() {
        const response = Notifications.getLastNotificationResponse();

        // Handle notification from background
        if (response?.notification) {
            setNotificationData(response.notification.request.content.data);
        }

        // Handle notification from foreground
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
