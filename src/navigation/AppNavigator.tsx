import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useTermsStore } from '../store/termsStore';
import { subscribeAuthExpired } from '../store/authEvents';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { Colors } from '../theme/colors';
import { FontFamilies, FontSizes } from '../theme/typography';
import { Radius, Shadow, Spacing } from '../theme/spacing';

export const AppNavigator: React.FC = () => {
  const { email, isAuthenticated, isLoading, restoreToken, role, logout } = useAuthStore();
  const restoreProfiles = useProfileStore((state) => state.restoreProfiles);
  const syncCurrentCustomer = useProfileStore((state) => state.syncCurrentCustomer);
  const isDocumentImagesComplete = useProfileStore((state) => state.isDocumentImagesComplete(email));
  const isProfileLoading = useProfileStore((state) => state.isLoading);
  const restoreTermsAcceptances = useTermsStore((state) => state.restoreTermsAcceptances);
  const [showDocumentReminder, setShowDocumentReminder] = useState(false);
  const [hasDismissedDocumentReminder, setHasDismissedDocumentReminder] = useState(false);
  const navigationRef = React.useRef<any>(null);

  useEffect(() => {
    restoreToken();
    restoreProfiles();
    restoreTermsAcceptances();
  }, [restoreProfiles, restoreTermsAcceptances, restoreToken]);

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
    if (isAuthenticated && role === 'CUSTOMER' && !isProfileLoading) {
      syncCurrentCustomer(email);
    }
  }, [email, isAuthenticated, isProfileLoading, role, syncCurrentCustomer]);

  useEffect(() => {
    if (
      isAuthenticated &&
      role === 'CUSTOMER' &&
      email &&
      !isProfileLoading &&
      !isDocumentImagesComplete &&
      !hasDismissedDocumentReminder
    ) {
      setShowDocumentReminder(true);
    } else {
      setShowDocumentReminder(false);
    }
  }, [email, hasDismissedDocumentReminder, isAuthenticated, isDocumentImagesComplete, isProfileLoading, role]);

  const dismissDocumentReminder = () => {
    setHasDismissedDocumentReminder(true);
    setShowDocumentReminder(false);
  };

  const openDocumentVerification = () => {
    setShowDocumentReminder(false);
    setHasDismissedDocumentReminder(true);
    navigationRef.current?.navigate('DocumentVerification');
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated && role === 'EMPLOYEE' ? <AdminNavigator /> : <MainNavigator />}
      {/* Test customer screen without login: <MainNavigator /> */}
      {/* Test admin screen without login: <AdminNavigator /> */}
      <Modal
        transparent
        visible={showDocumentReminder}
        animationType="fade"
        onRequestClose={dismissDocumentReminder}
      >
        <TouchableWithoutFeedback onPress={dismissDocumentReminder}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.reminderCard, Shadow.card]}>
                <Text style={styles.reminderTitle}>Bổ sung giấy tờ xác thực</Text>
                <Text style={styles.reminderBody}>
                  Hồ sơ của bạn còn thiếu ảnh CCCD hoặc giấy phép lái xe. Bạn có thể bỏ qua lúc này và bổ sung khi thuê xe.
                </Text>
                <View style={styles.reminderActions}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={dismissDocumentReminder} activeOpacity={0.78}>
                    <Text style={styles.secondaryButtonText}>Để sau</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButton} onPress={openDocumentVerification} activeOpacity={0.82}>
                    <Text style={styles.primaryButtonText}>Xác thực ngay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
  },
  reminderCard: {
    width: '100%',
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    padding: 18,
  },
  reminderTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  reminderBody: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.stackLg,
  },
  primaryButton: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryContainer,
  },
  primaryButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
  secondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  secondaryButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
});
