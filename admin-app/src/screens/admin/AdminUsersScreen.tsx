import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { carApi, Car } from '../../api/car.api';
import { rentalApi, Rental } from '../../api/rental.api';
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
import { getRentalAmount, getShortId } from '../../utils/rentalUtils';

interface CustomerSummary {
  customerId: string;
  rentals: Rental[];
  totalSpent: number;
}

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUsers'>;

export const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
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
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải danh sách khách hàng.'));
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
  const customers = useMemo<CustomerSummary[]>(() => {
    const grouped = new Map<string, Rental[]>();
    rentals.forEach((rental) => {
      const current = grouped.get(rental.customerId) ?? [];
      current.push(rental);
      grouped.set(rental.customerId, current);
    });

    return Array.from(grouped.entries())
      .map(([customerId, customerRentals]) => ({
        customerId,
        rentals: customerRentals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        totalSpent: customerRentals.reduce((sum, rental) => sum + getRentalAmount(rental, carById.get(rental.carId)), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [carById, rentals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData()
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể làm mới khách hàng.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  if (isLoading) {
    return <ScreenState type="loading" message="Đang tải khách hàng từ booking..." />;
  }

  if (error) {
    return <ScreenState type="error" title="Không tải được khách hàng" message={error} actionLabel="Thử lại" onAction={onRefresh} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.customerId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primaryContainer} />
            <Text style={styles.noticeText}>
              Backend hiện chưa có customer/user controller. Danh sách này được suy ra từ API đơn thuê thật.
            </Text>
          </View>
        }
        ListEmptyComponent={<ScreenState type="empty" icon="people-outline" title="Chưa có khách hàng" message="Chưa có booking nào để tổng hợp khách hàng." />}
        renderItem={({ item }) => {
          const latest = item.rentals[0];
          const latestStatus = RENTAL_STATUS_CONFIG[latest.rentalStatus];
          return (
            <TouchableOpacity style={[styles.customerCard, Shadow.card]} onPress={() => setSelectedCustomer(item)} activeOpacity={0.86}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getShortId(item.customerId).slice(0, 1)}</Text>
              </View>
              <View style={styles.customerCopy}>
                <Text style={styles.customerName}>Khách #{getShortId(item.customerId)}</Text>
                <Text style={styles.meta}>{item.rentals.length} đơn thuê - {formatVND(item.totalSpent)}</Text>
                <View style={styles.statusLine}>
                  <StatusBadge label="Tài khoản: chưa có API" color={Colors.onSurfaceVariant} bg={Colors.surfaceContainerHigh} icon="shield-outline" />
                  <StatusBadge {...latestStatus} />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
          );
        }}
      />

      <CustomerDetailModal
        customer={selectedCustomer}
        carById={carById}
        onOpenRental={(rentalId) => {
          setSelectedCustomer(null);
          navigation.navigate('AdminRentalDetail', { rentalId });
        }}
        onClose={() => setSelectedCustomer(null)}
      />
    </View>
  );
};

const CustomerDetailModal = ({
  customer,
  carById,
  onOpenRental,
  onClose,
}: {
  customer: CustomerSummary | null;
  carById: Map<string, Car>;
  onOpenRental: (rentalId: string) => void;
  onClose: () => void;
}) => {
  if (!customer) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalKicker}>Khách hàng</Text>
            <Text style={styles.modalTitle}>#{getShortId(customer.customerId)}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, Shadow.card]}>
          <Text style={styles.summaryValue}>{formatVND(customer.totalSpent)}</Text>
          <Text style={styles.summaryLabel}>Tổng chi tiêu từ các đơn thuê</Text>
          <Text style={styles.summaryHint}>Trạng thái tài khoản cần endpoint user/customer từ backend.</Text>
        </View>

        <Text style={styles.sectionTitle}>Lịch sử thuê</Text>
        {customer.rentals.map((rental) => {
          const car = carById.get(rental.carId);
          const status = RENTAL_STATUS_CONFIG[rental.rentalStatus];
          return (
            <TouchableOpacity key={rental.id} style={[styles.historyCard, Shadow.card]} onPress={() => onOpenRental(rental.id)} activeOpacity={0.86}>
              <View style={styles.historyTop}>
                <Text style={styles.historyTitle}>{car ? `${car.brand} ${car.model}` : `Xe #${getShortId(rental.carId)}`}</Text>
                <StatusBadge {...status} />
              </View>
              <Text style={styles.historyMeta}>{formatDateTimeVN(rental.pickUpAt)} - {formatDateTimeVN(rental.dropOffAt)}</Text>
              <View style={styles.historyBottom}>
                <Text style={styles.historyAmount}>{formatVND(getRentalAmount(rental, car))}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding * 2,
    gap: Spacing.stackMd,
  },
  notice: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryFixed,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 16,
    color: Colors.onPrimaryFixed,
  },
  customerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.primaryContainer,
  },
  customerCopy: { flex: 1, gap: 6 },
  customerName: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  meta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  statusLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 3,
    paddingBottom: Spacing.containerVerticalPadding * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.stackMd,
  },
  modalKicker: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  modalTitle: {
    fontFamily: FontFamilies.numericBold,
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
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
  },
  summaryValue: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 28,
    color: Colors.primaryContainer,
  },
  summaryLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
    marginTop: 4,
  },
  summaryHint: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginTop: Spacing.stackLg,
    marginBottom: Spacing.stackSm,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: Spacing.stackMd,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  historyTitle: {
    flex: 1,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  historyMeta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 10,
  },
  historyAmount: {
    fontFamily: FontFamilies.numericBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
  historyBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
});
