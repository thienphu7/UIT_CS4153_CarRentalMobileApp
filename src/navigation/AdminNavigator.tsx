import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { FontFamilies } from '../theme/typography';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminCarsScreen } from '../screens/admin/AdminCarsScreen';
import { AdminRentalsScreen } from '../screens/admin/AdminRentalsScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminCars: undefined;
  AdminRentals: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.white },
      headerTintColor: Colors.onSurface,
      headerTitleStyle: { fontFamily: FontFamilies.sansSemiBold, fontSize: 18 },
    }}
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AdminCars" component={AdminCarsScreen} options={{ title: 'Quản lý xe' }} />
    <Stack.Screen name="AdminRentals" component={AdminRentalsScreen} options={{ title: 'Quản lý đơn thuê' }} />
  </Stack.Navigator>
);
