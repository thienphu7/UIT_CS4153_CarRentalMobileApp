import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { getDisplayNameFromEmail } from '../../utils/userDisplay';

const MenuItem = ({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon as any} size={20} color={danger ? Colors.error : Colors.primaryContainer} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.outline} />}
  </TouchableOpacity>
);

export const ProfileScreen: React.FC = () => {
  const { email, isAuthenticated, logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const isVerificationComplete = useProfileStore((state) => state.isVerificationComplete(email));
  const displayName = getDisplayNameFromEmail(email) || 'Người dùng';

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Extract first letter for avatar
  const avatarLetter = displayName[0].toUpperCase();

  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={38} color={Colors.onPrimary} />
          </View>
          <Text style={styles.name}>Tài khoản</Text>
          <Text style={styles.role}>Đăng nhập để quản lý hồ sơ và đặt xe</Text>
        </View>

        <View style={[styles.authCard, Shadow.card]}>
          <Text style={styles.authTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.authSubtitle}>
            Đăng nhập hoặc tạo tài khoản để xác thực giấy tờ, theo dõi đơn thuê và thanh toán.
          </Text>
          <Button
            title="Đăng nhập"
            onPress={() => navigation.navigate('Login')}
            style={styles.authButton}
          />
          <Button
            title="Đăng ký"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>

        <View style={[styles.menuCard, Shadow.card]}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <MenuItem
            icon="help-circle-outline"
            label="Trung tâm hỗ trợ"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label="Điều khoản & Chính sách"
            onPress={() => navigation.navigate('TermsPolicy')}
          />
        </View>

        <Text style={styles.version}>Car Rental v1.0.0</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>Khách hàng</Text>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, Shadow.card]}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <MenuItem
          icon="person-outline"
          label={isVerificationComplete ? 'Thông tin cá nhân đã xác thực' : 'Xác thực thông tin cá nhân'}
          onPress={() => navigation.navigate('DocumentVerification')}
        />
        <MenuItem
          icon="car-outline"
          label="Lịch sử thuê xe"
          onPress={() => {}}
        />
        <MenuItem
          icon="notifications-outline"
          label="Thông báo"
          onPress={() => {}}
        />
      </View>

      <View style={[styles.menuCard, Shadow.card]}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        <MenuItem
          icon="help-circle-outline"
          label="Trung tâm hỗ trợ"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          label="Điều khoản & Chính sách"
          onPress={() => navigation.navigate('TermsPolicy')}
        />
      </View>

      <View style={[styles.menuCard, Shadow.card]}>
        <MenuItem
          icon="log-out-outline"
          label="Đăng xuất"
          onPress={handleLogout}
          danger
        />
      </View>

      <Text style={styles.version}>Car Rental v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  profileHeader: {
    backgroundColor: Colors.primaryContainer,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontFamily: FontFamilies.displayBold,
    fontSize: 36,
    color: Colors.onPrimary,
  },
  name: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onPrimary,
  },
  role: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: 'rgba(255,255,255,0.75)',
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.containerPadding,
    marginTop: Spacing.stackMd,
    overflow: 'hidden',
  },
  authCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.containerPadding,
    marginTop: Spacing.stackMd,
    padding: 16,
  },
  authTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginBottom: 6,
  },
  authSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  authButton: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.errorContainer,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  menuLabelDanger: {
    color: Colors.error,
    fontFamily: FontFamilies.sansSemiBold,
  },
  version: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.outlineVariant,
    textAlign: 'center',
    marginTop: Spacing.stackLg,
  },
});
