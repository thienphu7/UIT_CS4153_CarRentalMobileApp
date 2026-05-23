import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Login'>;
  route: RouteProp<MainStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ email, password });
      const redirectParams = route.params;
      if (redirectParams?.redirectTo === 'Payment' && redirectParams.carId) {
        const normalizedEmail = email.trim();
        const isVerificationComplete = useProfileStore
          .getState()
          .isVerificationComplete(normalizedEmail);

        if (isVerificationComplete) {
          navigation.replace('Payment', {
            carId: redirectParams.carId,
            location: redirectParams.location,
            pickUpAt: redirectParams.pickUpAt,
            dropOffAt: redirectParams.dropOffAt,
          });
        } else {
          navigation.replace('DocumentVerification', {
            redirectTo: 'Payment',
            carId: redirectParams.carId,
            location: redirectParams.location,
            pickUpAt: redirectParams.pickUpAt,
            dropOffAt: redirectParams.dropOffAt,
          });
        }
        return;
      }

      navigation.navigate('HomeTabs');
    } catch (e: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        getApiErrorMessage(e, 'Sai email hoặc mật khẩu')
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục trải nghiệm dịch vụ thuê xe cao cấp
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="example@email.com"
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

        {/* Login Button */}
        <Button
          title="Đăng nhập"
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.loginButton}
        />

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register', route.params)}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 4,
    paddingBottom: Spacing.containerVerticalPadding * 2,
  },
  header: {
    marginBottom: Spacing.sectionMargin,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  form: {
    marginBottom: Spacing.stackLg,
  },
  loginButton: {
    width: '100%',
    marginBottom: Spacing.stackMd,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.stackSm,
  },
  registerText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  registerLink: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.primaryContainer,
  },
});
