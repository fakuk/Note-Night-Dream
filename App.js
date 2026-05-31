import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import PINAuthScreen from './src/screens/PINAuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DreamEntryScreen from './src/screens/DreamEntryScreen';
import DreamDetailScreen from './src/screens/DreamDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0f1a' },
    }}
  >
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="DreamDetail" component={DreamDetailScreen} />
    <Stack.Screen name="DreamEntry" component={DreamEntryScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0f1a' },
    }}
  >
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'moon-waning-crescent' : 'moon-new';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#4a5d7d',
        tabBarStyle: {
          backgroundColor: '#0f1621',
          borderTopColor: '#00d4ff20',
          paddingBottom: insets.bottom || 10,
          height: 65 + (insets.bottom || 0),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dreams',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pin, setPin] = useState(null);

  useEffect(() => {
    checkPIN();
  }, []);

  const checkPIN = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('appPin');
      setPin(storedPin);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking PIN:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0a0f1a' },
          }}
        >
          {!isAuthenticated && pin ? (
            <Stack.Screen
              name="PINAuth"
              component={PINAuthScreen}
              options={{
                animationEnabled: false,
              }}
              listeners={({ navigation }) => ({
                beforeRemove: (e) => {
                  e.preventDefault();
                },
              })}
              initialParams={{ onAuthenticated: () => setIsAuthenticated(true) }}
            />
          ) : !isAuthenticated && !pin ? (
            <Stack.Screen
              name="PINSetup"
              component={PINAuthScreen}
              options={{
                animationEnabled: false,
              }}
              listeners={({ navigation }) => ({
                beforeRemove: (e) => {
                  e.preventDefault();
                },
              })}
              initialParams={{
                isSetup: true,
                onAuthenticated: () => setIsAuthenticated(true),
              }}
            />
          ) : (
            <Stack.Screen name="MainApp" component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
