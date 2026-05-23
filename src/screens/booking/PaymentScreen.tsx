import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useCarStore } from '../../store/carStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { rentalApi } from '../../api/rental.api';
import { BookingStepIndicator } from '../../components/booking/BookingStepIndicator';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { formatVND, formatPricePerHour } from '../../utils/formatCurrency';
import { formatDateTimeVN, toISOString, calcTotalAmount } from '../../utils/dateUtils';
import { getApiErrorMessage } from '../../utils/apiError';
import { saveRentalLocationsLocally } from '../../utils/localRentalOverrides';

import { Ionicons } from '@expo/vector-icons';

type PaymentScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Payment'>;
  route: RouteProp<MainStackParamList, 'Payment'>;
};

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { carId } = route.params;
  const { selectedCar, fetchCarById } = useCarStore();
  const { email, isAuthenticated } = useAuthStore();
  const isVerificationComplete = useProfileStore((state) => state.isVerificationComplete(email));
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [pickUpAt, setPickUpAt] = useState(new Date());
  const [dropOffAt, setDropOffAt] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [pickUpLocation, setPickUpLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet' | 'cash'>('bank');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // Date picker visibility
  const [showPickUp, setShowPickUp] = useState(false);
  const [showDropOff, setShowDropOff] = useState(false);

  useEffect(() => {
    if (!selectedCar || selectedCar.id !== carId) {
      fetchCarById(carId);
    }
  }, [carId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login', { redirectTo: 'Payment', carId });
      return;
    }

    if (!isVerificationComplete) {
      navigation.replace('DocumentVerification', { redirectTo: 'Payment', carId });
    }
  }, [carId, isAuthenticated, isVerificationComplete, navigation]);

  const car = selectedCar;
  const totalAmount = car
    ? calcTotalAmount(car.pricePerHour, toISOString(pickUpAt), toISOString(dropOffAt))
    : 0;

  const openAndroidDateTimePicker = (
    value: Date,
    minimumDate: Date,
    onConfirm: (date: Date) => void
  ) => {
    DateTimePickerAndroid.open({
      value,
      minimumDate,
      mode: 'date',
      onChange: (dateEvent: DateTimePickerEvent, selectedDate?: Date) => {
        if (dateEvent.type !== 'set' || !selectedDate) return;

        const nextDate = new Date(selectedDate);
        nextDate.setHours(value.getHours(), value.getMinutes(), 0, 0);

        setTimeout(() => {
          DateTimePickerAndroid.open({
            value: nextDate,
            mode: 'time',
            onChange: (timeEvent: DateTimePickerEvent, selectedTime?: Date) => {
              if (timeEvent.type !== 'set' || !selectedTime) return;

              const nextDateTime = new Date(nextDate);
              nextDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
              onConfirm(nextDateTime);
            },
          });
        }, 0);
      },
    });
  };

  const openPickUpPicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(pickUpAt, new Date(), setPickUpAt);
      return;
    }

    setShowPickUp(true);
  };

  const openDropOffPicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(dropOffAt, pickUpAt, setDropOffAt);
      return;
    }

    setShowDropOff(true);
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigation.replace('Login', { redirectTo: 'Payment', carId });
      return;
    }
    if (!isVerificationComplete) {
      Alert.alert(
        'Cần xác thực hồ sơ',
        'Vui lòng xác thực thông tin cá nhân, CCCD và GPLX trước khi thanh toán.',
        [
          {
            text: 'Xác thực ngay',
            onPress: () =>
              navigation.replace('DocumentVerification', { redirectTo: 'Payment', carId }),
          },
        ]
      );
      return;
    }
    if (!pickUpLocation.trim() || !dropOffLocation.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa điểm đón và trả xe');
      return;
    }
    if (dropOffAt <= pickUpAt) {
      Alert.alert('Thời gian không hợp lệ', 'Thời gian trả xe phải sau thời gian đón xe');
      return;
    }
    if (
      paymentMethod === 'card' &&
      (!cardHolder.trim() || cardNumber.replace(/\s/g, '').length < 12 || !cardExpiry.trim())
    ) {
      Alert.alert('Thiếu thông tin thanh toán', 'Vui lòng nhập tên chủ thẻ, số thẻ và ngày hết hạn.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await rentalApi.createRental({
        carId,
        pickUpAt: toISOString(pickUpAt),
        dropOffAt: toISOString(dropOffAt),
        pickUpLocation: pickUpLocation.trim(),
        dropOffLocation: dropOffLocation.trim(),
      });
      await saveRentalLocationsLocally(data.id, {
        pickUpLocation: pickUpLocation.trim(),
        dropOffLocation: dropOffLocation.trim(),
      });
      navigation.replace('BookingSuccess', { rentalId: data.id });
    } catch (e: any) {
      Alert.alert(
        'Đặt xe thất bại',
        getApiErrorMessage(e, 'Vui lòng thử lại sau')
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!car || !isVerificationComplete) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BookingStepIndicator currentStep={3} />

        {/* Car Summary */}
        <View style={[styles.carSummary, Shadow.card]}>
          <Text style={styles.carBrand} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.carPrice} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
            {formatPricePerHour(car.pricePerHour)}
          </Text>
        </View>

        {/* Date Pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian thuê xe</Text>

          <TouchableOpacity
            style={styles.datePicker}
            onPress={openPickUpPicker}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Thời gian đón</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(pickUpAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {Platform.OS !== 'android' && showPickUp && (
            <DateTimePicker
              value={pickUpAt}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowPickUp(false);
                if (date) setPickUpAt(date);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.datePicker}
            onPress={openDropOffPicker}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Thời gian trả</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(dropOffAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {Platform.OS !== 'android' && showDropOff && (
            <DateTimePicker
              value={dropOffAt}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={pickUpAt}
              onChange={(_, date) => {
                setShowDropOff(false);
                if (date) setDropOffAt(date);
              }}
            />
          )}
        </View>

        {/* Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa điểm</Text>
          <Input
            label="Địa điểm đón xe"
            placeholder="VD: 123 Nguyễn Văn Linh, Quận 7"
            value={pickUpLocation}
            onChangeText={setPickUpLocation}
          />
          <Input
            label="Địa điểm trả xe"
            placeholder="VD: Sân bay Tân Sơn Nhất"
            value={dropOffLocation}
            onChangeText={setDropOffLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.paymentMethods}>
            {[
              { value: 'bank', label: 'Chuyển khoản VietQR', subtitle: 'Xác nhận tự động 24/7', icon: 'qr-code-outline' },
              { value: 'card', label: 'Thẻ tín dụng / Ghi nợ', subtitle: 'Visa, Mastercard, JCB', icon: 'card-outline' },
              { value: 'wallet', label: 'Ví MoMo', subtitle: 'Miễn phí giao dịch', icon: 'wallet-outline' },
              { value: 'cash', label: 'Tiền mặt', subtitle: 'Thanh toán khi nhận xe', icon: 'cash-outline' },
            ].map((method) => {
              const active = paymentMethod === method.value;
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[styles.paymentMethod, active && styles.paymentMethodActive]}
                  onPress={() => setPaymentMethod(method.value as 'card' | 'bank' | 'wallet' | 'cash')}
                  activeOpacity={0.78}
                >
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.paymentMethodTextBlock}>
                    <Text style={[styles.paymentMethodLabel, active && styles.paymentMethodLabelActive]}>
                      {method.label}
                    </Text>
                    <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
                  </View>
                  <View style={styles.paymentMethodIcon}>
                    <Ionicons
                      name={method.icon as any}
                      size={22}
                      color={active ? Colors.primaryContainer : Colors.onSurfaceVariant}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {paymentMethod === 'card' && (
            <View style={styles.cardPaymentForm}>
              <Input
                label="Tên chủ thẻ"
                placeholder="NGUYEN VAN A"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
              <Input
                label="Số thẻ"
                placeholder="9704 0000 0000 0000"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
              />
              <Input
                label="Ngày hết hạn"
                placeholder="MM/YY"
                value={cardExpiry}
                onChangeText={setCardExpiry}
                keyboardType="number-pad"
              />
            </View>
          )}

          {paymentMethod === 'cash' && (
            <View style={[styles.paymentNote, styles.paymentFollowUp, Shadow.card]}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primaryContainer} />
              <Text style={styles.paymentNoteText}>
                Thanh toán tiền mặt khi nhận xe. Hồ sơ giấy tờ vẫn phải được xác thực trước.
              </Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, Shadow.card]}>
          <Text style={styles.sectionTitle}>Tổng kết đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Xe thuê</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{car.brand} {car.model}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đơn giá</Text>
            <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              {formatPricePerHour(car.pricePerHour)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phương thức</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {paymentMethod === 'card'
                ? 'Thẻ thanh toán'
                : paymentMethod === 'bank'
                  ? 'Chuyển khoản'
                  : paymentMethod === 'wallet'
                    ? 'Ví MoMo'
                    : 'Tiền mặt'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.76}>
              {formatVND(totalAmount)}
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPreview}>
          <Text style={styles.totalPreviewLabel}>Cần đặt cọc ngay</Text>
          <Text style={styles.totalPreviewValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
            500.000đ
          </Text>
        </View>
        <Button
          title="Xác nhận đặt cọc"
          onPress={handleBook}
          isLoading={isLoading}
          style={styles.confirmButton}
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
  carSummary: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.stackMd,
  },
  carBrand: {
    flex: 1,
    minWidth: 0,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  carPrice: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
    maxWidth: 148,
    textAlign: 'right',
  },
  section: { marginBottom: Spacing.stackMd },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...Shadow.card,
  },
  datePickerText: { flex: 1 },
  datePickerLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  datePickerValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
    marginTop: 2,
  },
  paymentMethods: {
    gap: 10,
    marginBottom: 14,
  },
  paymentMethod: {
    minHeight: 58,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  paymentMethodActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: '#eff4ff',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.primaryContainer,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.onPrimary,
  },
  paymentMethodTextBlock: { flex: 1, minWidth: 0 },
  paymentMethodLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    lineHeight: 18,
    color: Colors.onSurface,
  },
  paymentMethodLabelActive: {
    color: Colors.primaryContainer,
  },
  paymentMethodSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  paymentMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentNote: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  paymentFollowUp: {
    marginTop: 4,
  },
  cardPaymentForm: {
    marginTop: 4,
  },
  paymentNoteText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  summaryValue: {
    flex: 1,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
    textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 10 },
  totalLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  totalValue: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
    flex: 1,
    textAlign: 'right',
  },
  bottomBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + Spacing.stackMd,
    paddingTop: Spacing.containerVerticalPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalPreview: { flex: 1.05, minWidth: 0 },
  totalPreviewLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  totalPreviewValue: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
  },
  confirmButton: { flex: 1.2 },
});
