// notificationManager.ts
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

class NotificationService {
  private static instance: NotificationService;
  private currentChatId: string | null = null;
  private appState: string = AppState.currentState;

  private constructor() {
    // Track app state
    AppState.addEventListener('change', (nextAppState) => {
      this.appState = nextAppState;
    });

    // Set handler once
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const receiverId = notification.request.content.data?.receiverId as string;
        const shouldShow = this.shouldShowNotification(receiverId);

        return {
          shouldPlaySound: shouldShow,
          shouldSetBadge: shouldShow,
          shouldShowBanner: shouldShow,
          shouldShowList: shouldShow,
        };
      },
    });
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setCurrentChat(chatId: string | null) {
    this.currentChatId = chatId;
  }

  private shouldShowNotification(receiverId: string): boolean {
    const isOnSameChatScreen = this.currentChatId === receiverId;
    const isAppActive = this.appState === 'active';

    // Don't show if user is actively viewing this chat
    const shouldHide = isOnSameChatScreen && isAppActive;

    return !shouldHide;
  }
}

export default NotificationService.getInstance();