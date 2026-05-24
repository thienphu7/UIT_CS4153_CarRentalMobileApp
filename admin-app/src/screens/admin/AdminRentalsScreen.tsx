import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { carApi, Car } from '../../api/car.api';
import { rentalApi, Rental, RentalStatus } from '../../api/rental.api';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Button } from '../../components/common/Button';
import { ScreenState } from '../../components/common/ScreenState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import { BOOKING_FILTERS, RENTAL_STATUS_CONFIG } from '../../constants/rentalStatus';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatDateTimeVN } from '../../utils/dateUtils';
import { formatVND } from '../../utils/formatCurrency';
import { getApiErrorMessage } from '../../utils/apiError';
import { getRentalAmount, getRentalRouteText, getShortId, isPendingRental } from '../../utils/rentalUtils';

export const AdminRentalsScreen: React.FC = () => {
  const { showToast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<RentalStatus | undefined>();
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    const [rentalList, carList] = await Promise.all([
      rentalApi.fetchAdminRentals(),
      carApi.fetchCars({ limit: 100 }),
    ]);
    setRentals(rentalList);
    setCars(carList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadData()
        .catch((err) => {
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải danh sách đơn thuê.'));
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [loadData])
  );

  const carById = useMemo(() => new Map(cars.map((car) => [car.id, car])), [cars]);
  const filteredRentals = activeFilter
    ? rentals.filter((rental) => rental.rentalStatus === activeFilter)
    : rentals;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData()
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể làm mới đơn thuê.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  const changeStatus = async (rental: Rental, status: RentalStatus) => {
    setUpdatingId(rental.id);
    try {
      await rentalApi.requestAdminStatusChange(rental.id, status);
      showToast('Trạng thái đơn thuê đã được cập nhật.', 'success');
      await loadData();
    } catch (err) {
      const apiMessage = getApiErrorMessage(err, 'Backend chưa xử lý được thao tác này.');
      showToast(`Không thể cập nhật trạng thái. ${apiMessage}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openRentalDetail = async (rental: Rental) => {
    setSelectedRental(rental);
    try {
      const { data } = await rentalApi.fetchAdminRentalById(rental.id);
      setSelectedRental(data);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Không thể tải chi tiết đơn thuê.'), 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Đơn thuê" subtitle="Đang tải booking" actionIcon="filter-outline" />
        <ScreenState type="loading" message="Đang đồng bộ với API..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Đơn thuê" subtitle="Quản lý booking" actionIcon="filter-outline" />
        <ScreenState type="error" title="Không tải được đơn thuê" message={error} actionLabel="Thử lại" onAction={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Đơn thuê" subtitle={`${rentals.length} booking trong hệ thống`} actionIcon="filter-outline" />
      <FlatList
        data={filteredRentals}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {BOOKING_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[styles.filterChip, activeFilter === filter.status && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.status)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, activeFilter === filter.status && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
        ListEmptyComponent={
          <ScreenState type="empty" icon="calendar-outline" title="Chưa có đơn thuê" message="Không có booking phù hợp với bộ lọc hiện tại." />
        }
        renderItem={({ item }) => {
          const car = carById.get(item.carId);
          const status = RENTAL_STATUS_CONFIG[item.rentalStatus];
          const isUpdating = updatingId === item.id;
          return (
            <TouchableOpacity style={[styles.card, Shadow.card]} onPress={() => openRentalDetail(item)} activeOpacity={0.88}>
              <View style={styles.cardHeader}>
                <Text style={styles.customer} numberOfLines={1}>KH #{getShortId(item.customerId)}</Text>
                <StatusBadge {...status} />
              </View>
              <View style={styles.carRow}>
                <View style={styles.carThumb}>
                  <Ionicons name="car-sport-outline" size={22} color={Colors.primaryContainer} />
                </View>
                <View style={styles.carCopy}>
                  <Text style={styles.carName} numberOfLines={1}>
                    {car ? `${car.brand} ${car.model}` : `Xe #${getShortId(item.carId)}`}
                  </Text>
                  <Text style={styles.time} numberOfLines={1}>
                    {formatDateTimeVN(item.pickUpAt)} - {formatDateTimeVN(item.dropOffAt)}
                  </Text>
                  <Text style={styles.route} numberOfLines={1}>{getRentalRouteText(item)}</Text>
                </View>
              </View>
              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.amountLabel}>Tổng tiền</Text>
                  <Text style={styles.amount}>{formatVND(getRentalAmount(item, car))}</Text>
                </View>
                {isPendingRental(item) ? (
                  <View style={styles.actions}>
                    <Button
                      title="Từ chối"
                      variant="secondary"
                      disabled={isUpdating}
                      onPress={() => changeStatus(item, 'REJECTED')}
                      style={styles.smallButton}
                      textStyle={styles.rejectText}
                    />
                    <Button
                      title="Duyệt"
                      isLoading={isUpdating}
                      onPress={() => changeStatus(item, 'APPROVED')}
                      style={styles.smallButton}
                    />
                  </View>
                ) : (
                  <Button title="Theo dõi" variant="secondary" onPress={() => openRentalDetail(item)} style={styles.followButton} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <RentalDetailModal
        rental={selectedRental}
        car={selectedRental ? carById.get(selectedRental.carId) : undefined}
        onClose={() => setSelectedRental(null)}
        onStatusChange={changeStatus}
        isUpdating={!!selectedRental && updatingId === selectedRental.id}
      />
    </View>
  );
};

interface RentalDetailModalProps {
  rental: Rental | null;
  car?: Car;
  onClose: () => void;
  onStatusChange: (rental: Rental, status: RentalStatus) => void;
  isUpdating: boolean;
}

const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  rental,
  car,
  onClose,
  onStatusChange,
  isUpdating,
}) => {
  if (!rental) return null;
  const status = RENTAL_STATUS_CONFIG[rental.rentalStatus];
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalKicker}>Chi tiết đơn thuê</Text>
            <Text style={styles.modalTitle}>#{getShortId(rental.id)}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={[styles.detailCard, Shadow.card]}>
          <StatusBadge {...status} />
          <Text style={styles.detailTitle}>{car ? `${car.brand} ${car.model}` : `Xe #${getShortId(rental.carId)}`}</Text>
          <Text style={styles.detailMeta}>Khách hàng #{getShortId(rental.customerId)}</Text>
          <View style={styles.divider} />
          <InfoRow icon="calendar-outline" label="Nhận xe" value={formatDateTimeVN(rental.pickUpAt)} />
          <InfoRow icon="flag-outline" label="Trả xe" value={formatDateTimeVN(rental.dropOffAt)} />
          <InfoRow icon="location-outline" label="Lộ trình" value={getRentalRouteText(rental)} />
          <InfoRow icon="cash-outline" label="Tổng tiền" value={formatVND(getRentalAmount(rental, car))} />
        </View>

        {isPendingRental(rental) && (
          <View style={styles.modalActions}>
            <Button
              title="Từ chối"
              variant="secondary"
              disabled={isUpdating}
              onPress={() => onStatusChange(rental, 'REJECTED')}
              textStyle={styles.rejectText}
            />
            <Button title="Duyệt đơn" isLoading={isUpdating} onPress={() => onStatusChange(rental, 'APPROVED')} />
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={18} color={Colors.primaryContainer} />
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + 76,
  },
  filters: {
    gap: 8,
    paddingBottom: Spacing.stackMd,
  },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  filterText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  filterTextActive: {
    color: Colors.onPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: Spacing.stackMd,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  customer: {
    flex: 1,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  carRow: {
    flexDirection: 'row',
    gap: 12,
  },
  carThumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carCopy: { flex: 1 },
  carName: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  time: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  route: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 14,
  },
  amountLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  amount: {
    fontFamily: FontFamilies.numericBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    height: 40,
    minWidth: 74,
    paddingHorizontal: 12,
  },
  followButton: {
    height: 40,
    paddingHorizontal: 14,
  },
  rejectText: {
    color: Colors.error,
  },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 3,
    paddingBottom: Spacing.containerVerticalPadding * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.stackMd,
  },
  modalKicker: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  modalTitle: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
  },
  detailTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  detailMeta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
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
  modalActions: {
    gap: 12,
    marginTop: Spacing.stackLg,
  },
});
