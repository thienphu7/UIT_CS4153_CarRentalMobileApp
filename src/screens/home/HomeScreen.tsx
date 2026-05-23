import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useCarStore } from '../../store/carStore';
import { useAuthStore } from '../../store/authStore';
import { CarCard } from '../../components/common/CarCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Car } from '../../api/car.api';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { getDisplayNameFromEmail } from '../../utils/userDisplay';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
};

const CAR_TYPES = ['Tất cả', 'SUV', 'Sedan', 'Hatchback', 'MPV', 'Pickup'];
const HOME_CAR_LIMIT = 100;
const FEATURED_CAR_COUNT = 3;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { email } = useAuthStore();
  const { cars, isLoading, fetchCars } = useCarStore();
  const [selectedType, setSelectedType] = React.useState('Tất cả');
  const [refreshing, setRefreshing] = React.useState(false);
  const displayName = getDisplayNameFromEmail(email);

  useEffect(() => {
    fetchCars({ carStatus: 'AVAILABLE', limit: HOME_CAR_LIMIT });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const params =
      selectedType === 'Tất cả'
        ? { carStatus: 'AVAILABLE' as const, limit: HOME_CAR_LIMIT }
        : { carType: selectedType, carStatus: 'AVAILABLE' as const, limit: HOME_CAR_LIMIT };
    await fetchCars(params);
    setRefreshing(false);
  };

  const handleFilterType = (type: string) => {
    setSelectedType(type);
    if (type === 'Tất cả') {
      fetchCars({ carStatus: 'AVAILABLE', limit: HOME_CAR_LIMIT });
    } else {
      fetchCars({ carType: type, carStatus: 'AVAILABLE', limit: HOME_CAR_LIMIT });
    }
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetail', { carId: car.id });
  };

  const featuredCars = cars.slice(0, FEATURED_CAR_COUNT);
  const allCars = cars;

  if (isLoading && cars.length === 0) return <LoadingOverlay />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primaryContainer} />
      }
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingLabel}>Xin chào</Text>
          <Text style={styles.greetingName} numberOfLines={1}>{displayName || 'Bạn'}</Text>
        </View>
        <Text style={styles.headline}>Tìm xe ưng ý của bạn</Text>
      </View>

      {/* Featured — Horizontal Scroll */}
      {featuredCars.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Xe nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search' as any)}>
              <Text style={styles.seeAll}>Tìm xe</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredCars}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.featuredList}
            renderItem={({ item }) => (
              <CarCard car={item} onPress={handleCarPress} horizontal />
            )}
          />
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loại xe</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CAR_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
              onPress={() => handleFilterType(type)}
            >
              <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* All Cars List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedType === 'Tất cả' ? 'Tất cả xe' : selectedType} ({allCars.length})
        </Text>
        {allCars.map((car) => (
          <CarCard key={car.id} car={car} onPress={handleCarPress} />
        ))}
        {allCars.length === 0 && (
          <Text style={styles.emptyText}>Không tìm thấy xe phù hợp</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  header: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 60,
    paddingBottom: Spacing.sectionMargin,
  },
  greetingBlock: {
    marginBottom: 14,
  },
  greetingLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  greetingName: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.primaryContainer,
    marginTop: 2,
  },
  headline: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    lineHeight: 34,
  },
  section: {
    marginBottom: Spacing.sectionMargin,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerPadding,
    marginBottom: Spacing.stackMd,
  },
  sectionHeaderTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.containerPadding,
    marginBottom: Spacing.stackMd,
  },
  seeAll: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    lineHeight: 28,
    color: Colors.primaryContainer,
  },
  featuredList: {
    paddingLeft: Spacing.containerPadding,
    paddingRight: Spacing.containerPadding,
    paddingBottom: 12,
  },
  filterScroll: { paddingLeft: Spacing.containerPadding, marginBottom: Spacing.stackMd },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  filterChipText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
  },
  emptyText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
