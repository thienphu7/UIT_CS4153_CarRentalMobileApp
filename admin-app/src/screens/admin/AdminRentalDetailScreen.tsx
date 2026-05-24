import React, { useCallback, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { carApi, Car } from '../../api/car.api';
import { rentalApi, Rental } from '../../api/rental.api';
import { Button } from '../../components/common/Button';
import { ScreenState } from '../../components/common/ScreenState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import { RENTAL_STATUS_CONFIG } from '../../constants/rentalStatus';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatDateTimeVN } from '../../utils/dateUtils';
import { formatVND } from '../../utils/formatCurrency';
import { getApiErrorMessage } from '../../utils/apiError';
import { getRentalAmount, getRentalRouteText, getShortId, isPendingRental } from '../../utils/rentalUtils';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminRentalDetail'>;

export const AdminRentalDetailScreen: React.FC<Props> = ({ route }) => {
  const { rentalId } = route.params;
  const { showToast } = useToast();
  const [rental, setRental] = useState<Rental | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setError(null);
    const { data } = await rentalApi.fetchAdminRentalById(rentalId);
    setRental(data);
    try {
      const carResponse = await carApi.fetchCarById(data.carId);
      setCar(carResponse.data);
    } catch {
      setCar(null);
    }
  }, [rentalId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadDetail()
        .catch((err) => {
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải chi tiết đơn thuê.'));
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [loadDetail])
  );

  const status = useMemo(() => rental ? RENTAL_STATUS_CONFIG[rental.rentalStatus] : null, [rental]);

  const changeStatus = async (nextStatus: 'APPROVED' | 'REJECTED') => {
    if (!rental) return;
    setIsUpdating(true);
    try {
      await rentalApi.requestAdminStatusChange(rental.id, nextStatus);
      showToast('Trạng thái đơn thuê đã được cập nhật.', 'success');
      await loadDetail();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Không thể cập nhật trạng thái đơn thuê.'), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <ScreenState type="loading" message="Đang tải chi tiết đơn thuê..." />;
  }

  if (error || !rental || !status) {
    return <ScreenState type="error" title="Không tải được đơn thuê" message={error ?? 'Không tìm thấy đơn thuê.'} actionLabel="Thử lại" onAction={loadDetail} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroCard, Shadow.card]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.kicker}>Chi tiết đơn thuê</Text>
            <Text style={styles.title}>#{getShortId(rental.id)}</Text>
          </View>
          <StatusBadge {...status} />
        </View>
        <Text style={styles.carTitle}>{car ? `${car.brand} ${car.model}` : `Xe #${getShortId(rental.carId)}`}</Text>
        <Text style={styles.customer}>Khách hàng #{getShortId(rental.customerId)}</Text>
      </View>

      <View style={[styles.sectionCard, Shadow.card]}>
        <InfoRow icon="calendar-outline" label="Nhận xe" value={formatDateTimeVN(rental.pickUpAt)} />
        <InfoRow icon="flag-outline" label="Trả xe" value={formatDateTimeVN(rental.dropOffAt)} />
        <InfoRow icon="location-outline" label="Lộ trình" value={getRentalRouteText(rental)} />
        <InfoRow icon="cash-outline" label="Tổng tiền" value={formatVND(getRentalAmount(rental, car))} />
      </View>

      {car && (
        <View style={[styles.sectionCard, Shadow.card]}>
          <Text style={styles.sectionTitle}>Thông tin xe</Text>
          <InfoRow icon="pricetag-outline" label="Biển số" value={car.licensePlate} />
          <InfoRow icon="people-outline" label="Số chỗ" value={`${car.capacity} chỗ`} />
          <InfoRow icon="color-palette-outline" label="Màu sắc" value={car.color} />
        </View>
      )}

      {isPendingRental(rental) && (
        <View style={styles.actions}>
          <Button title="Từ chối" variant="secondary" disabled={isUpdating} onPress={() => changeStatus('REJECTED')} textStyle={styles.rejectText} />
          <Button title="Duyệt đơn" isLoading={isUpdating} onPress={() => changeStatus('APPROVED')} />
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon as any} size={18} color={Colors.primaryContainer} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding + 24,
    gap: Spacing.stackMd,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  title: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 28,
    color: Colors.onSurface,
    marginTop: 2,
  },
  carTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginTop: 14,
  },
  customer: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: { flex: 1 },
  infoLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  infoValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
    marginTop: 2,
  },
  actions: {
    gap: 12,
    marginTop: Spacing.stackSm,
  },
  rejectText: {
    color: Colors.error,
  },
});
