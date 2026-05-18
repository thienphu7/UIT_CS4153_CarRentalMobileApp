import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingOverlay } from '../components/common/LoadingOverlay';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreToken, role } = useAuthStore();

  useEffect(() => {
    restoreToken();
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? role === 'EMPLOYEE' ? <AdminNavigator /> : <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
