import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { PresenceProvider } from '@/contexts/PresenceContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Retour' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="display" options={{ headerShown: false }} />
      <Stack.Screen name="employee/register" options={{ headerShown: true }} />
      <Stack.Screen name="employee/login" options={{ headerShown: true }} />
      <Stack.Screen name="employee/home" options={{ headerShown: true }} />
      <Stack.Screen name="employee/history" options={{ headerShown: true }} />
      <Stack.Screen name="admin/dashboard" options={{ headerShown: true }} />
      <Stack.Screen name="admin/mark-absence" options={{ headerShown: true }} />
      <Stack.Screen name="admin/stats" options={{ headerShown: true }} />

    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <PresenceProvider>
            <RootLayoutNav />
          </PresenceProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
