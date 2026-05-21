import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { subscribeAuthExpired } from '../store/authEvents';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { useToast } from '../components/common/Toast';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreToken, role, logout } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  useEffect(() => {
    return subscribeAuthExpired(() => {
      logout();
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
    });
  }, [logout, showToast]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? role === 'EMPLOYEE' ? <AdminNavigator /> : <MainNavigator /> : <AuthNavigator />}
      {/*<MainNavigator />*/}
      {/*<AdminNavigator />}*/}
    </NavigationContainer>
  );
};
