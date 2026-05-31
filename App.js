// App.js  ─  Note Night Dream
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { COLORS } from './src/utils/theme';

import PinScreen        from './src/screens/PinScreen';
import DashboardScreen  from './src/screens/DashboardScreen';
import DreamEntryScreen from './src/screens/DreamEntryScreen';
import SettingsScreen   from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Default dark navigator theme
const DarkNavTheme = {
  dark: true,
  colors: {
    primary:    COLORS.neonBlue,
    background: COLORS.bg,
    card:       COLORS.bg,
    text:       COLORS.textPrimary,
    border:     COLORS.bgCardBorder,
    notification: COLORS.neonBlue,
  },
};

function AppNavigator() {
  const { authenticated, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.neonBlue} size="large" />
      </View>
    );
  }

  if (!authenticated) {
    return <PinScreen />;
  }

  return (
    <NavigationContainer theme={DarkNavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      >
        <Stack.Screen name="Dashboard"  component={DashboardScreen}  />
        <Stack.Screen name="DreamEntry" component={DreamEntryScreen} />
        <Stack.Screen name="Settings"   component={SettingsScreen}   />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
