import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useTermsStore } from '../store/termsStore';
import { subscribeAuthExpired } from '../store/authEvents';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { useToast } from '../components/common/Toast';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreToken, role, logout } = useAuthStore();
  const restoreProfiles = useProfileStore((state) => state.restoreProfiles);
  const restoreTermsAcceptances = useTermsStore((state) => state.restoreTermsAcceptances);
  const { showToast } = useToast();

  useEffect(() => {
    restoreToken();
    restoreProfiles();
    restoreTermsAcceptances();
  }, [restoreProfiles, restoreTermsAcceptances, restoreToken]);

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
      {isAuthenticated && role === 'EMPLOYEE' ? <AdminNavigator /> : <MainNavigator />}
      {/* Test customer screen without login: <MainNavigator /> */}
      {/* Test admin screen without login: <AdminNavigator /> */}
    </NavigationContainer>
  );
};
