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
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useCarStore } from '../../store/carStore';
import { rentalApi } from '../../api/rental.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { formatVND, formatPricePerHour } from '../../utils/formatCurrency';
import { formatDateTimeVN, toISOString, calcTotalAmount } from '../../utils/dateUtils';

import { Ionicons } from '@expo/vector-icons';

type PaymentScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Payment'>;
  route: RouteProp<MainStackParamList, 'Payment'>;
};

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { carId } = route.params;
  const { selectedCar, fetchCarById } = useCarStore();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [pickUpAt, setPickUpAt] = useState(new Date());
  const [dropOffAt, setDropOffAt] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [pickUpLocation, setPickUpLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');

  // Date picker visibility
  const [showPickUp, setShowPickUp] = useState(false);
  const [showDropOff, setShowDropOff] = useState(false);

  useEffect(() => {
    if (!selectedCar || selectedCar.id !== carId) {
      fetchCarById(carId);
    }
  }, [carId]);

  const car = selectedCar;
  const totalAmount = car
    ? calcTotalAmount(car.pricePerHour, toISOString(pickUpAt), toISOString(dropOffAt))
    : 0;

  const handleBook = async () => {
    if (!pickUpLocation.trim() || !dropOffLocation.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa điểm đón và trả xe');
      return;
    }
    if (dropOffAt <= pickUpAt) {
      Alert.alert('Thời gian không hợp lệ', 'Thời gian trả xe phải sau thời gian đón xe');
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
      navigation.replace('BookingSuccess', { rentalId: data.id });
    } catch (e: any) {
      Alert.alert(
        'Đặt xe thất bại',
        e?.response?.data?.message || 'Vui lòng thử lại sau'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!car) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Car Summary */}
        <View style={[styles.carSummary, Shadow.card]}>
          <Text style={styles.carBrand}>{car.brand} {car.model}</Text>
          <Text style={styles.carPrice}>{formatPricePerHour(car.pricePerHour)}</Text>
        </View>

        {/* Date Pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian thuê xe</Text>

          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowPickUp(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Thời gian đón</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(pickUpAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {showPickUp && (
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
            onPress={() => setShowDropOff(true)}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Thời gian trả</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(dropOffAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {showDropOff && (
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

        {/* Order Summary */}
        <View style={[styles.summaryCard, Shadow.card]}>
          <Text style={styles.sectionTitle}>Tổng kết đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Xe thuê</Text>
            <Text style={styles.summaryValue}>{car.brand} {car.model}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đơn giá</Text>
            <Text style={styles.summaryValue}>{formatPricePerHour(car.pricePerHour)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatVND(totalAmount)}</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPreview}>
          <Text style={styles.totalPreviewLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalPreviewValue}>{formatVND(totalAmount)}</Text>
        </View>
        <Button
          title="Xác nhận đặt xe"
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
    paddingTop: Spacing.stackMd,
  },
  carSummary: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.stackMd,
  },
  carBrand: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  carPrice: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
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
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  summaryValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 10 },
  totalLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  totalValue: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
  bottomBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalPreview: { flex: 1 },
  totalPreviewLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  totalPreviewValue: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
  confirmButton: { flex: 1 },
});
