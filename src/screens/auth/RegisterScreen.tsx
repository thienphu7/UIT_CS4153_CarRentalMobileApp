import React from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/authStore';
import { RegisterPayload } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      address: '',
      driverLicense: '',
      dateOfBirth: null,
    },
  });

  const onSubmit = async (data: RegisterPayload) => {
    try {
      await register(data);
      Alert.alert(
        'Đăng ký thành công! 🎉',
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e: any) {
      Alert.alert(
        'Đăng ký thất bại',
        e?.response?.data?.message || 'Vui lòng thử lại'
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
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Điền đầy đủ thông tin để bắt đầu thuê xe ngay hôm nay
          </Text>
        </View>

        {/* Form Fields */}
        <Controller
          control={control}
          name="fullName"
          rules={{ required: 'Họ tên không được để trống' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={value}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email không được để trống',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Email không hợp lệ' },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Mật khẩu không được để trống',
            minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Mật khẩu"
              placeholder="Tối thiểu 8 ký tự"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          rules={{ required: 'Số điện thoại không được để trống' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Số điện thoại"
              placeholder="0901234567"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          rules={{ required: 'Địa chỉ không được để trống' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Địa chỉ"
              placeholder="123 Đường ABC, TP.HCM"
              value={value}
              onChangeText={onChange}
              error={errors.address?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="driverLicense"
          rules={{ required: 'Số bằng lái không được để trống' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Số bằng lái xe"
              placeholder="012345678"
              value={value}
              onChangeText={onChange}
              error={errors.driverLicense?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Ngày sinh (tuỳ chọn)"
              placeholder="1990-01-25"
              value={value || ''}
              onChangeText={onChange}
              error={errors.dateOfBirth?.message}
            />
          )}
        />

        {/* Submit */}
        <Button
          title="Đăng ký"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={styles.submitButton}
        />

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { marginBottom: Spacing.sectionMargin },
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
  submitButton: { width: '100%', marginTop: 8, marginBottom: Spacing.stackMd },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.stackSm,
  },
  loginText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.primaryContainer,
  },
});
