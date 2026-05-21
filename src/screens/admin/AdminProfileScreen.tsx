import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useToast } from '../../components/common/Toast';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

export const AdminProfileScreen: React.FC = () => {
  const { email, logout } = useAuthStore();
  const { showToast } = useToast();
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{email?.slice(0, 1).toUpperCase() ?? 'A'}</Text>
          </View>
          <Text style={styles.name}>Admin</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>EMPLOYEE</Text>
          </View>
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
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryFixedDim }}
      thumbColor={value ? Colors.primaryContainer : Colors.white}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 96,
    gap: Spacing.stackMd,
  },
  profileCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
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
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  menuIcon: {
    width: 34,
    height: 34,
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
