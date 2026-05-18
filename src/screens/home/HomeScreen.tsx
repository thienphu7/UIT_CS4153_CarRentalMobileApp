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

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
};

const CAR_TYPES = ['Tất cả', 'SUV', 'Sedan', 'Hatchback', 'MPV', 'Pickup'];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { email } = useAuthStore();
  const { cars, isLoading, fetchCars } = useCarStore();
  const [selectedType, setSelectedType] = React.useState('Tất cả');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchCars({ carStatus: 'AVAILABLE' });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const params = selectedType === 'Tất cả' ? { carStatus: 'AVAILABLE' as const } : { carType: selectedType, carStatus: 'AVAILABLE' as const };
    await fetchCars(params);
    setRefreshing(false);
  };

  const handleFilterType = (type: string) => {
    setSelectedType(type);
    if (type === 'Tất cả') {
      fetchCars({ carStatus: 'AVAILABLE' });
    } else {
      fetchCars({ carType: type, carStatus: 'AVAILABLE' });
    }
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetail', { carId: car.id });
  };

  const featuredCars = cars.slice(0, 3);
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
        <Text style={styles.greeting}>Xin chào 👋</Text>
        <Text style={styles.email} numberOfLines={1}>{email}</Text>
        <Text style={styles.headline}>Tìm xe ưng ý của bạn</Text>
      </View>

      {/* Featured — Horizontal Scroll */}
      {featuredCars.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Xe nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search' as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredCars}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingLeft: Spacing.containerPadding }}
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
  greeting: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  email: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.primaryContainer,
    marginBottom: 12,
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
    color: Colors.primaryContainer,
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
