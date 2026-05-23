import React, { useCallback, useMemo, useState } from 'react';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList, AdminTabParamList } from '../../navigation/AdminNavigator';
import { carApi, Car } from '../../api/car.api';
import { rentalApi, Rental } from '../../api/rental.api';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { ScreenState, SkeletonBlock } from '../../components/common/ScreenState';
import { useToast } from '../../components/common/Toast';
import { RENTAL_STATUS_CONFIG } from '../../constants/rentalStatus';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatVND } from '../../utils/formatCurrency';
import { getApiErrorMessage } from '../../utils/apiError';
import { countByStatus, getRentalAmount, getShortId } from '../../utils/rentalUtils';

type DashboardNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'AdminDashboard'>,
  NativeStackNavigationProp<AdminStackParamList>
>;

type Props = {
  navigation: DashboardNavigation;
};

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    const [carList, rentalList] = await Promise.all([
      carApi.fetchCars({ limit: 100 }),
      rentalApi.fetchAdminRentals(),
    ]);
    setCars(carList);
    setRentals(rentalList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadData()
        .catch((err) => {
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải dữ liệu quản trị.'));
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData()
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể làm mới dashboard.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  const carById = useMemo(() => new Map(cars.map((car) => [car.id, car])), [cars]);
  const revenue = rentals.reduce((sum, rental) => sum + getRentalAmount(rental, carById.get(rental.carId)), 0);
  const pendingRentals = rentals.filter((rental) => rental.rentalStatus === 'PENDING');
  const activeRentals = countByStatus(rentals, 'ACTIVE') + countByStatus(rentals, 'APPROVED');
  const activeCars = cars.filter((car) => car.status === 'AVAILABLE').length;

  const metrics = [
    { label: 'Đang hoạt động', value: activeCars.toString(), icon: 'car-sport-outline', tone: 'primary' as const },
    { label: 'Đơn thuê', value: rentals.length.toString(), icon: 'receipt-outline', tone: 'neutral' as const },
    { label: 'Chờ duyệt', value: pendingRentals.length.toString(), icon: 'time-outline', tone: 'warning' as const },
    { label: 'Doanh thu', value: formatVND(revenue), icon: 'cash-outline', tone: 'success' as const },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Quản trị hệ thống" subtitle="Đang đồng bộ dữ liệu" />
        <View style={styles.skeletonGrid}>
          <SkeletonBlock height={118} style={styles.skeletonHalf} />
          <SkeletonBlock height={118} style={styles.skeletonHalf} />
          <SkeletonBlock height={118} style={styles.skeletonHalf} />
          <SkeletonBlock height={118} style={styles.skeletonHalf} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Quản trị hệ thống" subtitle="Cần kiểm tra kết nối API" />
        <ScreenState type="error" title="Không tải được dashboard" message={error} actionLabel="Thử lại" onAction={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Quản trị hệ thống" subtitle="Tổng quan hoạt động hôm nay" />
      <FlatList
        data={metrics}
        keyExtractor={(item) => item.label}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />}
        columnWrapperStyle={styles.metricRow}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <AdminMetricCard {...item} />}
        ListHeaderComponent={
          pendingRentals.length > 0 ? (
            <TouchableOpacity
              style={[styles.approvalCard, Shadow.card]}
              onPress={() => navigation.navigate('AdminRentals')}
              activeOpacity={0.86}
            >
              <View style={styles.approvalTop}>
                <View>
                  <Text style={styles.urgentLabel}>Cần xử lý ngay</Text>
                  <Text style={styles.approvalValue}>{pendingRentals.length}</Text>
                  <Text style={styles.approvalCaption}>Đơn chờ duyệt</Text>
                </View>
                <View style={styles.approvalIcon}>
                  <Ionicons name="alert-outline" size={24} color={Colors.error} />
                </View>
              </View>
              <View style={styles.approvalButton}>
                <Text style={styles.approvalButtonText}>Xử lý ngay</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.onPrimary} />
              </View>
            </TouchableOpacity>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            {rentals.slice(0, 3).map((rental) => {
              const status = RENTAL_STATUS_CONFIG[rental.rentalStatus];
              const car = carById.get(rental.carId);
              return (
                <TouchableOpacity
                  key={rental.id}
                  style={[styles.recentItem, Shadow.card]}
                  onPress={() => navigation.navigate('AdminRentals')}
                  activeOpacity={0.86}
                >
                  <View style={styles.recentThumb}>
                    <Ionicons name="receipt-outline" size={18} color={Colors.primaryContainer} />
                  </View>
                  <View style={styles.recentCopy}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {car ? `${car.brand} ${car.model}` : `Đơn #${getShortId(rental.id)}`}
                    </Text>
                    <Text style={styles.recentMeta} numberOfLines={1}>
                      KH #{getShortId(rental.customerId)}
                    </Text>
                  </View>
                  <Text style={[styles.recentStatus, { color: status.color }]}>{status.label}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('AdminCars')} activeOpacity={0.84}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.primaryContainer} />
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Quản lý xe</Text>
                <Text style={styles.actionSubtitle}>Thêm, sửa trạng thái và vô hiệu hóa xe</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('AdminUsers')} activeOpacity={0.84}>
              <Ionicons name="people-outline" size={22} color={Colors.primaryContainer} />
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Khách hàng</Text>
                <Text style={styles.actionSubtitle}>Danh sách khách và lịch sử thuê</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + 76,
    gap: Spacing.gridGutter,
  },
  metricRow: { gap: Spacing.gridGutter, marginBottom: Spacing.gridGutter },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.gridGutter,
    paddingHorizontal: Spacing.containerPadding,
  },
  skeletonHalf: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  approvalCard: {
    backgroundColor: '#ffd9d6',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: Spacing.stackMd,
  },
  approvalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  urgentLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.error,
  },
  approvalValue: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 28,
    color: Colors.onSurface,
    marginTop: 6,
  },
  approvalCaption: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  approvalIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalButton: {
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  approvalButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
  footer: {
    marginTop: Spacing.stackMd,
    gap: Spacing.stackSm,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginTop: Spacing.stackMd,
  },
  recentItem: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentThumb: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCopy: { flex: 1 },
  recentTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  recentMeta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  recentStatus: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
  },
  action: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionCopy: { flex: 1 },
  actionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  actionSubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
