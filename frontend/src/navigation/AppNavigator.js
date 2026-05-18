import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import SearchExploreScreen from '../screens/SearchExploreScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ReelsScreen from '../screens/ReelsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoryViewerScreen from '../screens/StoryViewerScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
  },
};

const tabIcon = (routeName, focused, color) => {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Explore: focused ? 'search' : 'search-outline',
    Create: 'add-circle',
    Reels: focused ? 'play-circle' : 'play-circle-outline',
    Profile: focused ? 'person' : 'person-outline',
  };

  return <Ionicons name={icons[routeName]} size={routeName === 'Create' ? 32 : 24} color={color} />;
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.mintDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 68,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color }) => tabIcon(route.name, focused, color),
      })}
    >
      <Tabs.Screen name="Home" component={HomeFeedScreen} />
      <Tabs.Screen name="Explore" component={SearchExploreScreen} />
      <Tabs.Screen name="Create" component={CreatePostScreen} />
      <Tabs.Screen name="Reels" component={ReelsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!user ? (
        <AuthStack />
      ) : !user.profileSetupCompleted ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}
