// src/navigation/AppNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import all the screens the navigator will use
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import BrowseProductsScreen from '../screens/BrowseProductsScreen';
import StoresScreen from '../screens/StoresScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NewListScreen from '../screens/NewListScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import EditListScreen from '../screens/EditListScreen'; // Import the new screen


// --- TYPE DEFINITIONS ---

// Define the parameters for each screen in the Bottom Tab navigator
export type AppTabParamList = {
  ShoppingLists: undefined; // 'undefined' means no params are expected for this route
  BrowseProducts: undefined;
  Stores: undefined;
  Settings: undefined;
};

// Define the parameters for each screen in the main Stack navigator
export type RootStackParamList = {
  MainTabs: undefined; // This route renders the entire Tab Navigator
  NewListModal: undefined; // The modal for creating a new list
  ListDetailScreen: { listId: number }; // The detail screen, which requires a listId
  EditListScreen: { listId: number }; // The edit screen, which also requires a listId
};

// Create the navigator instances
const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * This component defines the Bottom Tab structure.
 * It's kept separate for clarity and is used as a single screen
 * within our main Stack Navigator.
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, }}
    >
      <Tab.Screen 
        name="ShoppingLists" 
        component={ShoppingListsScreen} 
        options={{ 
          title: 'My Lists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="BrowseProducts" 
        component={BrowseProductsScreen} 
        options={{ 
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Stores" 
        component={StoresScreen} 
        options={{ 
          title: 'Stores',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
}

/**
 * This is the main App Navigator.
 * It uses a Stack Navigator to manage the main app (the tabs)
 * and any screens that should appear over the top, like modals or detail pages.
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* Group for main app flow */}
      <Stack.Group>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ title: "My Lists" }} // Hide the Stack header for the screen that contains the tabs
        />
        <Stack.Screen
          name="ListDetailScreen"
          component={ListDetailScreen}
          // The title for this screen is set dynamically inside the component itself
        />
        <Stack.Screen
          name="EditListScreen"
          component={EditListScreen}
          options={{ title: 'Edit List' }} // Title for the edit screen
        />
      </Stack.Group>

      {/* Group for modal screens. This allows different presentation styles. */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="NewListModal"
          component={NewListScreen}
          options={{ title: 'Create New List' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}