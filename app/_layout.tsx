import mobileAds from 'react-native-google-mobile-ads';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TreasuryProvider } from "@/contexts/TreasuryContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new-receipt" options={{ headerShown: false }} />
      <Stack.Screen name="new-expense" options={{ headerShown: false }} />
      <Stack.Screen name="reports" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      await mobileAds().initialize();
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <TreasuryProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </TreasuryProvider>
    </QueryClientProvider>
  );
}
