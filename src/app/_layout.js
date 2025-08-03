import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Onboarding from '../components/onboarding/onboarding';
import { Colors } from "../constants/color";


export default function RootLayout() {

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  

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
      
        <View style={{ 
          flex: 1, 
          backgroundColor: Colors.dark.background 
        }} />
      
    );
  }

  if (showOnboarding) {
    return (
      
          <Onboarding onDone={handleOnboardingDone} />
       
    );
  }

  return (
    
        <Stack
          screenOptions={{
            headerShown: false, 
            
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
      
  );
}