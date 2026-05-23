import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { carApi, Car, QueryCarsParams } from '../../api/car.api';
import { CarCard } from '../../components/common/CarCard';
import { ScreenState } from '../../components/common/ScreenState';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Heights, Radius, Spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
};

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'createdAt' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortValue>('createdAt');
  const [error, setError] = useState<string | null>(null);

  const sortCars = (data: Car[], sortValue: SortValue = selectedSort) => {
    if (sortValue === 'price_asc') return [...data].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortValue === 'price_desc') return [...data].sort((a, b) => b.pricePerHour - a.pricePerHour);
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const handleSearch = async (sortValue: SortValue = selectedSort, forceAll = false) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    const params: QueryCarsParams = {
      carStatus: 'AVAILABLE',
      limit: 100,
    };

    const text = forceAll ? '' : searchText.trim();
    if (text) params.search = text;

    try {
      const data = await carApi.fetchCars(params);
      setCars(sortCars(data, sortValue));
    } catch (err) {
      setCars([]);
      setError(getApiErrorMessage(err, 'Không thể tìm kiếm xe.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sortValue: SortValue) => {
    setSelectedSort(sortValue);

    if (sortValue === 'price_asc' || sortValue === 'price_desc') {
      handleSearch(sortValue, true);
      return;
    }

    if (hasSearched) {
      handleSearch(sortValue);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setCars([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Tìm kiếm xe</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo hãng xe, mẫu xe..."
            placeholderTextColor={Colors.outline}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCorrect
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortChip, selectedSort === opt.value && styles.sortChipActive]}
              onPress={() => handleSortChange(opt.value)}
            >
              <Text style={[styles.sortChipText, selectedSort === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()} activeOpacity={0.86}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
        {isLoading && <ScreenState type="loading" message="Đang tìm xe phù hợp..." />}
        {!isLoading && error && <ScreenState type="error" title="Tìm kiếm thất bại" message={error} actionLabel="Thử lại" onAction={handleSearch} />}
        {!isLoading && !error && hasSearched && cars.length === 0 && (
          <ScreenState type="empty" icon="car-outline" title="Không tìm thấy xe" message="Thử tìm với từ khóa khác." />
        )}
        {!isLoading && !error && !hasSearched && (
          <ScreenState type="empty" icon="search-outline" title="Tìm xe phù hợp" message="Nhập hãng xe hoặc mẫu xe để bắt đầu." />
        )}
        {!isLoading && !error && cars.map((car) => (
          <CarCard key={car.id} car={car} onPress={(item) => navigation.navigate('CarDetail', { carId: item.id })} />
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
});
