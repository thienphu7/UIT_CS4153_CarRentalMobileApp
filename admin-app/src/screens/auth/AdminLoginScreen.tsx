import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';

export const AdminLoginScreen: React.FC = () => {
  const { login, logout, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = 'Email không hợp lệ';
    if (!password) nextErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 8) nextErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });
      const role = useAuthStore.getState().role;
      if (role !== 'EMPLOYEE') {
        await logout();
        Alert.alert('Không có quyền quản trị', 'Tài khoản này không phải tài khoản nhân viên.');
      }
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', getApiErrorMessage(error, 'Sai email hoặc mật khẩu.'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.kicker}>ĐI VIỆT Admin</Text>
          <Text style={styles.title}>Quản trị hệ thống</Text>
          <Text style={styles.subtitle}>Đăng nhập bằng tài khoản nhân viên để quản lý xe và đơn thuê.</Text>

          <View style={styles.form}>
            <Input
              label="Email nhân viên"
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
          </View>

          <Button title="Đăng nhập quản trị" onPress={handleLogin} isLoading={isLoading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.containerVerticalPadding * 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 20,
  },
  kicker: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  form: {
    marginTop: Spacing.sectionMargin,
    marginBottom: Spacing.stackLg,
  },
});
