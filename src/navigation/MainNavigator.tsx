import React from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontFamilies } from '../theme/typography';
import { Heights } from '../theme/spacing';
import { HomeScreen } from '../screens/home/HomeScreen';
import { QuickRentalSearchScreen } from '../screens/home/QuickRentalSearchScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { MyRentalsScreen } from '../screens/rental/MyRentalsScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DocumentVerificationScreen } from '../screens/profile/DocumentVerificationScreen';
import { TermsPolicyScreen } from '../screens/profile/TermsPolicyScreen';
import { CarDetailScreen } from '../screens/car/CarDetailScreen';
import { PaymentScreen } from '../screens/booking/PaymentScreen';
import { BookingSuccessScreen } from '../screens/booking/BookingSuccessScreen';
import { TripReviewScreen } from '../screens/rental/TripReviewScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: { location?: string; pickUpAt?: string; dropOffAt?: string } | undefined;
  Rentals: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  HomeTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  QuickRentalSearch: { location?: string; pickUpAt?: string; dropOffAt?: string } | undefined;
  CarDetail: { carId: string };
  Payment: { carId: string };
  DocumentVerification: { redirectTo?: 'Payment'; carId?: string } | undefined;
  TermsPolicy: undefined;
  BookingSuccess: { rentalId: string };
  TripReview: { rentalId: string };
  Login: { redirectTo?: 'Payment'; carId?: string } | undefined;
  Register: { redirectTo?: 'Payment'; carId?: string } | undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const HomeTabs: React.FC = () => (
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
      },
      tabBarIcon: ({ color }) => {
        const icons: Record<keyof MainTabParamList, string> = {
          Home: 'home-outline',
          Search: 'search-outline',
          Rentals: 'car-outline',
          Messages: 'chatbubble-outline',
          Profile: 'person-outline',
        };
        return <Ionicons name={icons[route.name] as any} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
    <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Tìm xe' }} />
    <Tab.Screen name="Rentals" component={MyRentalsScreen} options={{ tabBarLabel: 'Đơn thuê' }} />
    <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: 'Tin nhắn' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const MainNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.white },
      headerTintColor: Colors.onSurface,
      headerTitleStyle: {
        fontFamily: FontFamilies.sansSemiBold,
        fontSize: 18,
      },
    }}
  >
    <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
    <Stack.Screen name="QuickRentalSearch" component={QuickRentalSearchScreen} options={{ title: 'Thông tin thuê xe' }} />
    <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ title: 'Chi tiết xe' }} />
    <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} options={{ title: 'Xác thực giấy tờ' }} />
    <Stack.Screen name="TermsPolicy" component={TermsPolicyScreen} options={{ title: 'Điều khoản & Chính sách' }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Đặt xe' }} />
    <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripReview" component={TripReviewScreen} options={{ title: 'Đánh giá chuyến đi' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);
