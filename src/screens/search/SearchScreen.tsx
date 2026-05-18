import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { carApi, Car, QueryCarsParams } from '../../api/car.api';
import { CarCard } from '../../components/common/CarCard';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius, Heights } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
};

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'createdAt' },
  { label: 'Giá tăng', value: 'pricePerDay_asc' },
  { label: 'Giá giảm', value: 'pricePerDay_desc' },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSort, setSelectedSort] = useState('createdAt');

  const handleSearch = async () => {
    if (!searchText.trim() && !hasSearched) return;
    setIsLoading(true);
    setHasSearched(true);

    const params: QueryCarsParams = {};
    const text = searchText.trim();
    if (text) {
      // Try to match brand or carType
      params.brand = text;
    }

    if (selectedSort === 'pricePerDay_asc') {
      params.sortBy = 'pricePerDay';
      params.sortOrder = 'asc';
    } else if (selectedSort === 'pricePerDay_desc') {
      params.sortBy = 'pricePerDay';
      params.sortOrder = 'desc';
    } else {
      params.sortBy = 'createdAt';
      params.sortOrder = 'desc';
    }
    params.carStatus = 'AVAILABLE';

    try {
      const data = await carApi.fetchCars(params);
      setCars(data);
    } catch {
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetail', { carId: car.id });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Tìm kiếm xe</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo hãng xe, loại xe..."
            placeholderTextColor={Colors.outline}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setCars([]); setHasSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortChip, selectedSort === opt.value && styles.sortChipActive]}
              onPress={() => { setSelectedSort(opt.value); }}
            >
              <Text style={[styles.sortChipText, selectedSort === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <LoadingOverlay />}
        {!isLoading && hasSearched && cars.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Không tìm thấy xe</Text>
            <Text style={styles.emptySubtitle}>Thử tìm với từ khoá khác</Text>
          </View>
        )}
        {!isLoading && !hasSearched && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Tìm xe phù hợp</Text>
            <Text style={styles.emptySubtitle}>Nhập tên hãng xe hoặc loại xe để bắt đầu</Text>
          </View>
        )}
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onPress={handleCarPress} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: Heights.input,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  sortRow: { marginBottom: 12 },
  sortChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  sortChipActive: { backgroundColor: Colors.surfaceContainer },
  sortChipText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  sortChipTextActive: {
    fontFamily: FontFamilies.sansSemiBold,
    color: Colors.primaryContainer,
  },
  searchButton: {
    height: 44,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
  results: { flex: 1 },
  resultsContent: {
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
