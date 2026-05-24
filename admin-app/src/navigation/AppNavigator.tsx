import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { subscribeAuthExpired } from '../store/authEvents';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { AdminNavigator } from './AdminNavigator';
import { AdminLoginScreen } from '../screens/auth/AdminLoginScreen';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreToken, role, logout } = useAuthStore();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    restoreToken().finally(() => setHasRestored(true));
  }, [restoreToken]);

  useEffect(() => {
    const unsubscribeAuthExpired = subscribeAuthExpired(() => {
      logout();
      Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.');
    });

    return () => {
      unsubscribeAuthExpired();
    };
  }, [logout]);

  useEffect(() => {
    if (hasRestored && isAuthenticated && role !== 'EMPLOYEE') {
      logout();
      Alert.alert('Không có quyền quản trị', 'Vui lòng đăng nhập bằng tài khoản nhân viên.');
    }
  }, [hasRestored, isAuthenticated, logout, role]);

  if (isLoading || !hasRestored) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated && role === 'EMPLOYEE' ? <AdminNavigator /> : <AdminLoginScreen />}
    </NavigationContainer>
  );
};
