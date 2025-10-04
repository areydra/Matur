import { INewReceivedMessage, PersonalChatView, PersonalChatViewRef } from '@/modules/personal-chat-view';
import { IResponseSendMessage } from '@/modules/personal-chat-view/src/PersonalChatView';
import HeaderChat from '@/src/components/HeaderChat';
import { supabase, supabaseKey, supabaseUrl } from '@/src/database/supabase';
import useExpoPushNotification from '@/src/hooks/useExpoPushNotification';
import { usePutMarkAsReadMessages } from '@/src/services/api/queryHooks';
import { useUserStore } from '@/src/store/userStore';
import { spacing } from '@/src/utils/theme';
import { RealtimeChannel } from '@supabase/realtime-js';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const inset = useSafeAreaInsets();
  const {
    senderId,
    senderName,
    senderAvatarUrl,
  } = useUserStore(useShallow((state) => ({
    senderId: state.userProfile?.id,
    senderName: state.userProfile?.name,
    senderAvatarUrl: state.userProfile?.avatar_url,
  })));
  const { chatId, receiverId, receiverName, receiverAvatarUrl } = useLocalSearchParams();
  const [session, setSession] = useState<{ access_token: string; refresh_token: string; } | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel>();
  const chatViewRef = React.useRef<PersonalChatViewRef>(null);
  const { mutate: markAsReadMessages } = usePutMarkAsReadMessages();
  const { sendPushNotification, clearChatNotifications } = useExpoPushNotification();

  useEffect(function clearNotification() {
    clearChatNotifications(chatId.toString());

    return () => {
      clearChatNotifications(chatId.toString());
    }
  }, [])

  useLayoutEffect(function setupSessionInNative() {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session);
    });
  }, []);

  useEffect(function handleUnmountScreen() {
    return () => {
      if (!senderId || !chatId.toString()) {
        return;
      }

      markAsReadMessages({ ownerId: senderId, chatId: chatId.toString() });
    }
  }, [senderId, chatId]);

  useEffect(function listenBroadcastMessage() {
    if (!senderId || !receiverId || typeof receiverId !== 'string') {
      return;
    }

    const chatChannel = supabase.channel(`chat_${chatId.toString()}`).on("broadcast", { event: "chat_message" }, (data: { payload: INewReceivedMessage }) => {
      chatViewRef.current?.addReceivedMessage(data.payload as INewReceivedMessage);
    }).subscribe();

    setChannel(chatChannel);

    return () => {
      chatChannel.unsubscribe();
    };
  }, [senderId, receiverId, chatId]);

  const sendBroadcastMessage = async (data: IResponseSendMessage) => {
    if (!channel) {
      return;
    }
    
    await channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: data.message,
    });

    sendPushNotification(receiverId.toString(), {
      title: senderName as string,
      body: data.message.message,
      badge: data.totalUnreadCount,
      data: {
        url: `/chat/[receiverId]`,
        chatId: chatId.toString(),
        receiverId: senderId,
        receiverName: senderName,
        receiverAvatarUrl: senderAvatarUrl,
      }
    });
  }

  return (
    <React.Fragment>
      <View style={styles.container}>
        <HeaderChat
          name={receiverName as string}
          profile={receiverAvatarUrl as string}
        />
        {(
          senderId &&
          receiverId &&
          supabaseUrl &&
          supabaseKey &&
          session?.access_token &&
          session?.refresh_token &&
          chatId
        ) ? (
          <PersonalChatView
            ref={chatViewRef}
            chatRoomCredentials={{
              senderId: senderId,
              receiverId: receiverId.toString(),
              supabaseUrl,
              supabaseKey,
              accessToken: session.access_token,
              refreshToken:session.refresh_token,
              chatId: chatId.toString(),
              chatRangeFrom: 0,
              chatRangeTo: 20,
            }}
            style={{
              width,
              height: height - (inset.bottom + inset.top),
              paddingBottom: spacing.md,
            }}
            onSendMessage={(event) => {
              sendBroadcastMessage({
                message: event.nativeEvent.message,
                totalUnreadCount: event.nativeEvent.totalUnreadCount,
              });
            }}
          />
        ) : (
          <Text>Loading..</Text>
        )}
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#220C61',
  },
});