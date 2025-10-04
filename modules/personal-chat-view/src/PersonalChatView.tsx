import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps, findNodeHandle } from 'react-native';

export interface INewReceivedMessage {
  chat_id: string;
  created_at: string;
  id: string;
  message: string;
  message_type: string;
  receiver_id: string;
  sender_id: string;
};

export interface IResponseSendMessage {
  message: INewReceivedMessage;
  totalUnreadCount: number;
}

export interface PersonalChatViewProps extends ViewProps {
  chatRoomCredentials: {
    senderId?: string;
    receiverId?: string;
    supabaseUrl?: string;
    supabaseKey?: string;
    accessToken?: string;
    refreshToken?: string;
    chatId: string;
    chatRangeFrom: number;
    chatRangeTo: number;
  };
  onSendMessage: (data: any) => void;
}

export interface PersonalChatViewRef {
  addReceivedMessage: (message: INewReceivedMessage) => void;
}

const NativeView = requireNativeViewManager('PersonalChatView');

const PersonalChatViewModule = requireNativeModule('PersonalChatView');

export default React.forwardRef<PersonalChatViewRef, PersonalChatViewProps>(
  function PersonalChatView(props, ref) {
    const nativeRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
      addReceivedMessage: (message: INewReceivedMessage) => {
        const nodeHandle = findNodeHandle(nativeRef.current);
        if (nodeHandle) {
          PersonalChatViewModule.addReceivedMessage(nodeHandle, message);
        }
      },
    }));

    const { onSendMessage, chatRoomCredentials, ...rest } = props;
    return (
      <NativeView
        {...rest}
        ref={nativeRef}
        chatRoomCredentials={chatRoomCredentials}
        onSendMessage={onSendMessage}
      />
    );
  }
);