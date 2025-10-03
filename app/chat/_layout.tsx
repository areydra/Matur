import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="[chatId]"
        options={{
          animation: 'slide_from_right',
          headerShown: false,
        }}
      />
    </Stack>
  );
}