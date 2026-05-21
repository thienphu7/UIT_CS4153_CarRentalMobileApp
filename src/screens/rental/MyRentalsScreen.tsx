import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { rentalApi, Rental } from '../../api/rental.api';
import { RentalCard } from '../../components/common/RentalCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { RentalStatus } from '../../api/rental.api';

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

  const loadRentals = useCallback(async () => {
    try {
      const data = await rentalApi.fetchMyRentals();
      setRentals(data);
    } catch {
      setRentals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRentals();
  }, []);

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
        <Text style={styles.count}>{rentals.length} đơn</Text>
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.label}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
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
        )}
        style={styles.filterScroll}
      />

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
    paddingTop: 60,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  count: {
    fontFamily: FontFamilies.numericSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  filterScroll: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  filterList: { paddingHorizontal: Spacing.containerPadding, paddingVertical: 12, gap: 8 },
  filterTab: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    marginRight: 8,
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
    paddingTop: Spacing.stackMd,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
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
