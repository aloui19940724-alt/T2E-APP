import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

import HomeScreen from '../screens/HomeScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import WalletScreen from '../screens/WalletScreen';
import VipScreen from '../screens/VipScreen';
import ReferralsScreen from '../screens/ReferralsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountScreen from '../screens/AccountScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AdvertiseScreen from '../screens/AdvertiseScreen';
import LegalScreen from '../screens/LegalScreen';
import ContactScreen from '../screens/ContactScreen';

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'المهام' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'المحفظة' }} />
      <Tab.Screen name="Vip" component={VipScreen} options={{ title: 'VIP' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'المتصدرون' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'حسابي' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <RootStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'تفاصيل المهمة' }} />
      <RootStack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'الإحالات' }} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'الإشعارات' }} />
      <RootStack.Screen name="Account" component={AccountScreen} options={{ title: 'حسابي والإعدادات' }} />
      <RootStack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'سجل المعاملات' }} />
      <RootStack.Screen name="Advertise" component={AdvertiseScreen} options={{ title: 'أعلن معنا' }} />
      <RootStack.Screen name="Legal" component={LegalScreen} options={{ title: 'الشروط والأحكام' }} />
      <RootStack.Screen name="Contact" component={ContactScreen} options={{ title: 'تواصل معنا' }} />
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
