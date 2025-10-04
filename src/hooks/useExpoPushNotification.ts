import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useGetExpoPushNotification, usePostExpoPushNotification, useSendPushNotification } from '../services/api/queryHooks';

export interface IPushNotificationPayload {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

const useExpoPushNotification = () => {
    const { mutateAsync: saveExpoPushNotification } = usePostExpoPushNotification()
    const { mutateAsync: getExpoPushNotification } = useGetExpoPushNotification()
    const { mutateAsync: mutateSendPushNotification } = useSendPushNotification()

    async function sendPushNotification(targetId: string, payload: { title: string; body: string, badge: number, data?: Record<string, any> }) {
        getExpoPushNotification({ userId: targetId }).then(data => {
            if (!data) {
                return;
            }

            data.map(item => {
                if (!item?.expo_push_notification) {
                    return;
                }

                const message: IPushNotificationPayload = {
                    to: item.expo_push_notification,
                    sound: 'default',
                    ...payload
                };

                mutateSendPushNotification(message);
            });
        });
    }

    async function saveExpoPushNotificationIntoDB(userId: string) {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                handleRegistrationError('Permission not granted to get push token for push notification!');
                return;
            }
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId) {
                handleRegistrationError('Project ID not found');
            }

            try {
                const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                saveExpoPushNotification({ userId, expoPushNotification: pushTokenString });
            } catch (e: unknown) {
                handleRegistrationError(`${e}`);
            }
        } else {
            handleRegistrationError('Must use physical device for push notifications');
        }
    }

    function handleRegistrationError(errorMessage: string) {
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    async function clearChatNotifications(chatId: string) {
        const notifications = await Notifications.getPresentedNotificationsAsync();
        
        const notificationsToRemove = notifications.filter(
            n => n.request.content.data?.chatId === chatId
        );
        
        for (const notification of notificationsToRemove) {
            await Notifications.dismissNotificationAsync(notification.request.identifier);
        }
        
        const currentBadge = await Notifications.getBadgeCountAsync();
        const newBadge = Math.max(0, currentBadge - notificationsToRemove.length);

        await Notifications.setBadgeCountAsync(newBadge);
    }

    return {
        sendPushNotification,
        saveExpoPushNotificationIntoDB,
        clearChatNotifications,
    }
}

export default useExpoPushNotification;