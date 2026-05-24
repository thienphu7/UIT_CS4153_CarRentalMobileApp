import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { BookingStepIndicator } from '../../components/booking/BookingStepIndicator';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

type DocumentVerificationScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DocumentVerification'>;
  route: RouteProp<MainStackParamList, 'DocumentVerification'>;
};

type ImageField = 'citizenIdFrontImageUri' | 'citizenIdBackImageUri' | 'driverLicenseImageUri';

const documentCards: Array<{ field: ImageField; title: string; subtitle: string; icon: string }> = [
  {
    field: 'citizenIdFrontImageUri',
    title: 'Ảnh mặt trước CCCD',
    subtitle: 'Chụp rõ số CCCD và họ tên',
    icon: 'card-outline',
  },
  {
    field: 'citizenIdBackImageUri',
    title: 'Ảnh mặt sau CCCD',
    subtitle: 'Chụp rõ ngày cấp và mã QR',
    icon: 'reader-outline',
  },
  {
    field: 'driverLicenseImageUri',
    title: 'Ảnh GPLX',
    subtitle: 'Chụp rõ số giấy phép lái xe',
    icon: 'car-sport-outline',
  },
];

export const DocumentVerificationScreen: React.FC<DocumentVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = useAuthStore();
  const { getProfile, saveProfile, restoreProfiles, syncCurrentCustomer } = useProfileStore();
  const savedProfile = getProfile(email);
  const [fullName, setFullName] = useState(savedProfile.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(savedProfile.phoneNumber ?? '');
  const [citizenId, setCitizenId] = useState(savedProfile.citizenId ?? '');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState(
    savedProfile.driverLicenseNumber ?? ''
  );
  const [citizenIdFrontImageUri, setCitizenIdFrontImageUri] = useState(
    savedProfile.citizenIdFrontImageUri ?? ''
  );
  const [citizenIdBackImageUri, setCitizenIdBackImageUri] = useState(
    savedProfile.citizenIdBackImageUri ?? ''
  );
  const [driverLicenseImageUri, setDriverLicenseImageUri] = useState(
    savedProfile.driverLicenseImageUri ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const isBookingFlow = route.params?.redirectTo === 'Payment';

  useEffect(() => {
    const loadProfile = async () => {
      await restoreProfiles();
      await syncCurrentCustomer(email);
    };

    loadProfile();
  }, [email, restoreProfiles, syncCurrentCustomer]);

  useEffect(() => {
    setFullName(savedProfile.fullName ?? '');
    setPhoneNumber(savedProfile.phoneNumber ?? '');
    setCitizenId(savedProfile.citizenId ?? '');
    setDriverLicenseNumber(savedProfile.driverLicenseNumber ?? '');
    setCitizenIdFrontImageUri(savedProfile.citizenIdFrontImageUri ?? '');
    setCitizenIdBackImageUri(savedProfile.citizenIdBackImageUri ?? '');
    setDriverLicenseImageUri(savedProfile.driverLicenseImageUri ?? '');
  }, [
    savedProfile.fullName,
    savedProfile.phoneNumber,
    savedProfile.citizenId,
    savedProfile.driverLicenseNumber,
    savedProfile.citizenIdFrontImageUri,
    savedProfile.citizenIdBackImageUri,
    savedProfile.driverLicenseImageUri,
  ]);

  const imageValues = useMemo(
    () => ({
      citizenIdFrontImageUri,
      citizenIdBackImageUri,
      driverLicenseImageUri,
    }),
    [citizenIdFrontImageUri, citizenIdBackImageUri, driverLicenseImageUri]
  );

  const completedCount = [
    fullName,
    phoneNumber,
    citizenId,
    driverLicenseNumber,
    citizenIdFrontImageUri,
    citizenIdBackImageUri,
    driverLicenseImageUri,
  ].filter((value) => value.trim()).length;

  const setImageValue = (field: ImageField, uri: string) => {
    if (field === 'citizenIdFrontImageUri') setCitizenIdFrontImageUri(uri);
    if (field === 'citizenIdBackImageUri') setCitizenIdBackImageUri(uri);
    if (field === 'driverLicenseImageUri') setDriverLicenseImageUri(uri);
  };

  const pickImage = async (field: ImageField) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập ảnh', 'Vui lòng cho phép ứng dụng chọn ảnh giấy tờ.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageValue(field, result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!email) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để xác thực giấy tờ.');
      return false;
    }

    if (
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !citizenId.trim() ||
      !driverLicenseNumber.trim() ||
      !citizenIdFrontImageUri ||
      !citizenIdBackImageUri ||
      !driverLicenseImageUri
    ) {
      Alert.alert('Hồ sơ chưa đủ', 'Vui lòng điền đầy đủ thông tin và tải đủ ảnh CCCD, GPLX.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate() || !email) return;

    setIsSaving(true);
    try {
      await saveProfile(email, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        citizenId: citizenId.trim(),
        driverLicenseNumber: driverLicenseNumber.trim(),
        citizenIdFrontImageUri,
        citizenIdBackImageUri,
        driverLicenseImageUri,
      });

      if (route.params?.redirectTo === 'Payment' && route.params.carId) {
        navigation.replace('Payment', {
          carId: route.params.carId,
          location: route.params.location,
          pickUpAt: route.params.pickUpAt,
          dropOffAt: route.params.dropOffAt,
        });
        return;
      }

      Alert.alert('Đã lưu hồ sơ', 'Thông tin xác thực của bạn đã được cập nhật.');
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  const renderUploadTile = (
    field: ImageField,
    title: string,
    subtitle: string,
    variant: 'half' | 'full'
  ) => {
    const uri = imageValues[field];

    return (
      <TouchableOpacity
        style={[styles.documentUpload, variant === 'half' ? styles.documentUploadHalf : styles.documentUploadFull]}
        onPress={() => pickImage(field)}
        activeOpacity={0.78}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.documentUploadImage} />
        ) : (
          <View style={styles.documentUploadEmpty}>
            <Ionicons
              name={variant === 'half' ? 'camera-outline' : 'card-outline'}
              size={variant === 'half' ? 28 : 30}
              color={Colors.outline}
            />
            <Text style={styles.documentUploadTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.documentUploadSubtitle}>{subtitle}</Text>}
          </View>
        )}
        {uri && (
          <View style={styles.documentUploadedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.documentUploadedText}>Đã tải lên</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isBookingFlow && <BookingStepIndicator currentStep={2} />}

        <View style={[styles.statusCard, Shadow.card]}>
          <View style={styles.statusIcon}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primaryContainer} />
          </View>
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>Xác thực giấy tờ</Text>
            <Text style={styles.statusSubtitle}>
              {isBookingFlow
                ? `Hoàn tất ${completedCount}/7 mục để mở bước thanh toán và đặt xe.`
                : `Hoàn tất ${completedCount}/7 mục để cập nhật hồ sơ thuê xe.`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <Input label="Họ và tên" placeholder="Nguyễn Văn A" value={fullName} onChangeText={setFullName} />
          <Input
            label="Số điện thoại"
            placeholder="0901234567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Input
            label="Số CCCD"
            placeholder="012345678901"
            value={citizenId}
            onChangeText={setCitizenId}
            keyboardType="number-pad"
          />
          <Input
            label="Số GPLX"
            placeholder="790123456789"
            value={driverLicenseNumber}
            onChangeText={setDriverLicenseNumber}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.documentSectionHeader}>
            <Ionicons name="id-card-outline" size={18} color={Colors.primaryContainer} />
            <Text style={styles.documentSectionTitle}>Căn cước công dân (Bắt buộc)</Text>
          </View>
          <View style={styles.citizenUploadRow}>
            {renderUploadTile('citizenIdFrontImageUri', 'Mặt trước', '', 'half')}
            {renderUploadTile('citizenIdBackImageUri', 'Mặt sau', '', 'half')}
          </View>

          <View style={styles.documentSectionHeader}>
            <Ionicons name="card-outline" size={18} color={Colors.primaryContainer} />
            <Text style={styles.documentSectionTitle}>Giấy phép lái xe (Bắt buộc)</Text>
          </View>
          {renderUploadTile(
            'driverLicenseImageUri',
            'Tải lên hình ảnh GPLX của bạn',
            'Đảm bảo rõ nét, không bị lóa sáng',
            'full'
          )}

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.noticeTextBlock}>
              <Text style={styles.noticeTitle}>Lưu ý quan trọng</Text>
              <Text style={styles.noticeText}>
                Thông tin của bạn được bảo mật tuyệt đối và chỉ sử dụng cho mục đích xác thực danh tính để thuê xe theo quy định của pháp luật.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={isBookingFlow ? 'Lưu và tiếp tục' : 'Lưu hồ sơ'}
          onPress={handleSave}
          isLoading={isSaving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.stackLg,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBlock: { flex: 1 },
  statusTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  statusSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  section: { marginBottom: Spacing.stackLg },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  documentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  documentSectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  citizenUploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  documentUpload: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  documentUploadHalf: {
    flex: 1,
    height: 120,
  },
  documentUploadFull: {
    height: 112,
    marginBottom: 22,
  },
  documentUploadEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  documentUploadImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  documentUploadTitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 10,
  },
  documentUploadSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  documentUploadedBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  documentUploadedText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSmBold,
    color: '#059669',
  },
  noticeBox: {
    backgroundColor: '#eef4ff',
    borderWidth: 1,
    borderColor: '#cfe0ff',
    borderRadius: Radius.md,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  noticeTextBlock: { flex: 1 },
  noticeTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  noticeText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  uploadCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  uploadPlaceholder: {
    width: 64,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentImage: {
    width: 64,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  uploadText: { flex: 1, minWidth: 0 },
  uploadTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  uploadSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  uploadAction: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSmBold,
    color: Colors.primaryContainer,
    marginTop: 4,
  },
  bottomSpacer: { height: 20 },
  bottomBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + Spacing.stackMd,
    paddingTop: Spacing.containerVerticalPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    ...Shadow.bottomNav,
  },
});
