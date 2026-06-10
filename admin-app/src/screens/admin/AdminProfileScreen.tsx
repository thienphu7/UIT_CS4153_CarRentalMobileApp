import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { employeeApi, EmployeeProfile } from '../../api/employee.api';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useToast } from '../../components/common/Toast';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

export const AdminProfileScreen: React.FC = () => {
  const { email, role, logout } = useAuthStore();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoadingProfile(true);
      employeeApi.fetchMe()
        .then(({ data }) => {
          if (isActive) setProfile(data);
        })
        .catch(() => {
          if (isActive) {
            setProfile(null);
            showToast('Không thể tải hồ sơ nhân viên từ API.', 'error');
          }
        })
        .finally(() => {
          if (isActive) setIsLoadingProfile(false);
        });
      return () => {
        isActive = false;
      };
    }, [showToast])
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const notifyLocalOnly = () => {
    showToast('Backend hiện chưa có endpoint lưu cài đặt. Thay đổi chỉ áp dụng trong phiên này.', 'info');
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Quản trị viên" subtitle="Hồ sơ và bảo mật" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, Shadow.card]}>
          {isLoadingProfile ? (
            <View style={styles.profileLoading}>
              <ActivityIndicator size="large" color={Colors.primaryContainer} />
              <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
            </View>
          ) : (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(profile?.fullName || email || 'A').slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{profile?.fullName ?? 'Nhân viên quản trị'}</Text>
              <Text style={styles.email}>{profile?.email ?? email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{profile?.position ?? role ?? 'EMPLOYEE'}</Text>
              </View>
              {profile?.hireDate && (
                <Text style={styles.hireDate}>Ngày vào làm: {new Date(profile.hireDate).toLocaleDateString('vi-VN')}</Text>
              )}
            </>
          )}
        </View>

        <View style={[styles.section, Shadow.card]}>
          <Text style={styles.sectionTitle}>Thông báo</Text>
          <SettingSwitch
            icon="receipt-outline"
            label="Booking mới"
            value={bookingAlerts}
            onValueChange={(value) => {
              setBookingAlerts(value);
              notifyLocalOnly();
            }}
          />
          <SettingSwitch
            icon="analytics-outline"
            label="Báo cáo hệ thống"
            value={systemAlerts}
            onValueChange={(value) => {
              setSystemAlerts(value);
              notifyLocalOnly();
            }}
          />
        </View>

        <View style={[styles.section, Shadow.card]}>
          <Text style={styles.sectionTitle}>Bảo mật</Text>
          <SettingSwitch
            icon="shield-checkmark-outline"
            label="Khóa sinh trắc học"
            value={biometricLock}
            onValueChange={(value) => {
              setBiometricLock(value);
              notifyLocalOnly();
            }}
          />
          <TouchableOpacity style={styles.menuItem} onPress={() => showToast('Đổi mật khẩu cần backend endpoint riêng.', 'info')}>
            <View style={styles.menuIcon}>
              <Ionicons name="key-outline" size={19} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.84}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

interface SettingSwitchProps {
  icon: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({ icon, label, value, onValueChange }) => (
  <View style={styles.menuItem}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon as any} size={19} color={Colors.primaryContainer} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
    <View style={styles.switchSlot}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryFixedDim }}
        thumbColor={value ? Colors.primaryContainer : Colors.white}
        style={styles.switch}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + 76,
    gap: Spacing.stackMd,
  },
  profileCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
  },
  profileLoading: {
    minHeight: 156,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 34,
    color: Colors.onPrimary,
  },
  name: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  email: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  hireDate: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  rolePill: {
    marginTop: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  roleText: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.labelSmBold,
    color: Colors.onPrimary,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  menuItem: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  switchSlot: {
    width: 46,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
  },
  logoutButton: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.stackSm,
  },
  logoutText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.error,
  },
});
