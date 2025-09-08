import Header from "@/src/components/Header";
import { Stack } from "expo-router";
import React from "react";

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          header: () => <Header/>,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          headerShown: true,
          header: () => <Header/>,
        }}
      />
    </Stack>
  );
};

export default OnboardingLayout;
