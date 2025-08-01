import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider
} from "react-native-paper";

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider
} from "@react-navigation/native";

import merge from "deepmerge";

import Onboarding from '../components/onboarding/onboarding';
import { Colors } from "../constants/color";

const customDarkTheme = { ...MD3DarkTheme, colors: Colors.dark };
const customLightTheme = { ...MD3LightTheme, colors: Colors.light };

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = merge(LightTheme, customLightTheme);
const CombinedDarkTheme = merge(DarkTheme, customDarkTheme);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const paperTheme = colorScheme === "dark" ? CombinedDarkTheme : CombinedLightTheme;

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding !== null) {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.log('Error checking first launch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <PaperProvider theme={paperTheme}>
        <View style={{ 
          flex: 1, 
          backgroundColor: paperTheme.colors.background 
        }} />
      </PaperProvider>
    );
  }

  if (showOnboarding) {
    return (
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={paperTheme}>
          <Onboarding onDone={handleOnboardingDone} />
        </ThemeProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={paperTheme}>
        <Stack
          screenOptions={{
            headerShown: false, 
            navigationBarColor: "#000000",
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="history-details"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}