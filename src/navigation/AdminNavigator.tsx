import React from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamilies } from '../theme/typography';
import { Heights, Shadow } from '../theme/spacing';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminCarsScreen } from '../screens/admin/AdminCarsScreen';
import { AdminRentalsScreen } from '../screens/admin/AdminRentalsScreen';
import { AdminMessagesScreen } from '../screens/admin/AdminMessagesScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminRentals: undefined;
  AdminCars: undefined;
  AdminMessages: undefined;
  AdminProfile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabParamList> | undefined;
  AdminUsers: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primaryContainer,
      tabBarInactiveTintColor: Colors.outline,
      tabBarLabelStyle: {
        fontFamily: FontFamilies.sansSemiBold,
        fontSize: 10,
      },
      tabBarStyle: {
        height: Heights.bottomNav,
        borderTopWidth: 1,
        borderTopColor: Colors.outlineVariant,
        paddingBottom: 8,
        paddingTop: 4,
        backgroundColor: Colors.white,
        ...Shadow.bottomNav,
      },
      tabBarIcon: ({ color }) => {
        const icons: Record<keyof AdminTabParamList, string> = {
          AdminDashboard: 'grid-outline',
          AdminRentals: 'calendar-outline',
          AdminCars: 'car-outline',
          AdminMessages: 'chatbubble-outline',
          AdminProfile: 'person-outline',
        };
        return <Ionicons name={icons[route.name] as any} size={21} color={color} />;
      },
    })}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="AdminRentals" component={AdminRentalsScreen} options={{ tabBarLabel: 'Đơn thuê' }} />
    <Tab.Screen name="AdminCars" component={AdminCarsScreen} options={{ tabBarLabel: 'Xe' }} />
    <Tab.Screen name="AdminMessages" component={AdminMessagesScreen} options={{ tabBarLabel: 'Tin nhắn' }} />
    <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const AdminNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.white },
      headerTintColor: Colors.onSurface,
      headerTitleStyle: { fontFamily: FontFamilies.sansSemiBold, fontSize: 18 },
    }}
  >
    <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Khách hàng' }} />
  </Stack.Navigator>
);
