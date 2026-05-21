import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { rentalApi, Rental } from '../../api/rental.api';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatVND } from '../../utils/formatCurrency';
import { formatDateTimeVN } from '../../utils/dateUtils';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  ACTIVE: 'Đang thuê',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
};

export const AdminRentalsScreen: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRentals = useCallback(async () => {
    setRentals(await rentalApi.fetchAdminRentals());
  }, []);

  useEffect(() => {
    loadRentals().catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách đơn thuê.'));
  }, [loadRentals]);

  const updateTimeOnly = async (rental: Rental) => {
    try {
      // This calls the only reliable admin PATCH route in the current BE.
      await rentalApi.updateRentalByEmployee(rental.id, {
        pickUpAt: rental.pickUpAt,
        dropOffAt: rental.dropOffAt,
        pickUpLocation: rental.pickUpLocation,
        dropOffLocation: rental.dropOffLocation,
      });
      Alert.alert('Đã đồng bộ', 'Đơn thuê đã được gán cho nhân viên hiện tại nếu BE cho phép.');
      await loadRentals();
    } catch (e: any) {
      Alert.alert('Cập nhật thất bại', e?.response?.data?.message || 'BE chưa xử lý được thao tác này.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRentals().finally(() => setRefreshing(false));
  };

  return (
    <FlatList
      style={styles.container}
      data={rentals}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn thuê nào.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, Shadow.card]}>
          <View style={styles.topRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{item.car?.brand ?? 'Xe'} {item.car?.model ?? item.carId}</Text>
              <Text style={styles.meta}>{item.customer?.fullName ?? item.customerId}</Text>
            </View>
            <Text style={styles.amount}>{formatVND(item.totalAmount)}</Text>
          </View>
          <Text style={styles.time}>Nhận: {formatDateTimeVN(item.pickUpAt)}</Text>
          <Text style={styles.time}>Trả: {formatDateTimeVN(item.dropOffAt)}</Text>
          <Text style={styles.location}>{`${item.pickUpLocation} -> ${item.dropOffLocation}`}</Text>
          <View style={styles.bottomRow}>
            <Text style={styles.status}>{statusLabel[item.rentalStatus] ?? item.rentalStatus}</Text>
            <Button title="Cập nhật" variant="secondary" onPress={() => updateTimeOnly(item)} style={styles.smallButton} />
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.containerPadding, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginBottom: Spacing.stackMd },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1 },
  title: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.h2Semibold, color: Colors.onSurface },
  meta: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.bodyMain, color: Colors.onSurfaceVariant, marginTop: 2 },
  amount: { fontFamily: FontFamilies.displayBold, fontSize: FontSizes.priceDisplay, color: Colors.primaryContainer },
  time: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant, marginTop: 8 },
  location: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.bodySemibold, color: Colors.onSurface, marginTop: 8 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  status: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.labelSm, color: Colors.primaryContainer },
  smallButton: { height: 40, paddingHorizontal: 14 },
  empty: { fontFamily: FontFamilies.sansRegular, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 60 },
});
