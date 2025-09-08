import { supabase } from "@/lib/supabase";
import Header from "@/src/components/Header";
import { useNavigationStore } from "@/src/store/navigationStore";
import { useUserStore } from "@/src/store/userStore";
import { Stack } from "expo-router";
import React from "react";

const SetupAccountLayout = () => {
  const clearUser = useUserStore((state) => state.clearUser);
  const resetToOnboarding = useNavigationStore((state) => state.resetToOnboarding);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <Header onPress={() => {
            resetToOnboarding();
            supabase.auth.signOut();
            clearUser();
          }}/>,
        }}
      />
    </Stack>
  );
};

export default SetupAccountLayout;
