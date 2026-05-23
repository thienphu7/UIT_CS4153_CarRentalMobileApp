import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { rentalApi, Rental } from '../../api/rental.api';
import { carApi, Car } from '../../api/car.api';
import { RentalCard } from '../../components/common/RentalCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { RentalStatus } from '../../api/rental.api';
import { getVisibleRentals } from '../../utils/localRentalOverrides';

type MyRentalsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
};

const FILTER_TABS: { label: string; status?: RentalStatus }[] = [
  { label: 'Tất cả' },
  { label: 'Chờ duyệt', status: 'PENDING' },
  { label: 'Đã duyệt', status: 'APPROVED' },
  { label: 'Đang thuê', status: 'ACTIVE' },
  { label: 'Hoàn thành', status: 'COMPLETED' },
  { label: 'Đã hủy', status: 'CANCELLED' },
];

export const MyRentalsScreen: React.FC<MyRentalsScreenProps> = ({ navigation }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<RentalStatus | undefined>(undefined);
  const [carsById, setCarsById] = useState<Record<string, Car>>({});

  const loadRentals = useCallback(async () => {
    try {
      const rentalData = await rentalApi.fetchMyRentals();
      setRentals(await getVisibleRentals(rentalData));

      try {
        const carData = await carApi.fetchCars({ limit: 100 });
        setCarsById(
          carData.reduce<Record<string, Car>>((acc, car) => {
            acc[car.id] = car;
            return acc;
          }, {})
        );
      } catch {
        setCarsById({});
      }
    } catch (error: any) {
      setRentals([]);
      setCarsById({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadRentals();
  }, [loadRentals]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRentals();
    setRefreshing(false);
  };

  const filteredRentals = activeFilter
    ? rentals.filter((r) => r.rentalStatus === activeFilter)
    : rentals;

  if (isLoading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Đơn thuê của tôi</Text>
        <View style={styles.countGroup}>
          <Text style={styles.countLabel}>Tổng đơn</Text>
          <Text style={styles.count}>{rentals.length} đơn</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTER_TABS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.filterTab,
                activeFilter === item.status && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(item.status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === item.status && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rental List */}
      <FlatList
        data={filteredRentals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryContainer}
          />
        }
        renderItem={({ item }) => (
          <RentalCard
            rental={item}
            car={carsById[item.carId]}
            onPress={() => navigation.navigate('TripReview', { rentalId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Chưa có đơn thuê nào</Text>
            <Text style={styles.emptySubtitle}>Hãy đặt xe để bắt đầu trải nghiệm</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 2,
    paddingBottom: Spacing.containerVerticalPadding / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  title: {
    flex: 1,
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  countGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 16,
  },
  countLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  count: {
    fontFamily: FontFamilies.numericSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  filterBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  filterList: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    borderRadius: Radius.pill,
    minWidth: 84,
    height: 36,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: { backgroundColor: Colors.primaryContainer },
  filterTabText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  filterTabTextActive: {
    fontFamily: FontFamilies.sansSemiBold,
    color: Colors.onPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding + Spacing.stackMd,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.containerVerticalPadding * 4,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
