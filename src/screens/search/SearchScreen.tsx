import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList, MainTabParamList } from '../../navigation/MainNavigator';
import { carApi, Car, QueryCarsParams } from '../../api/car.api';
import { CarCard } from '../../components/common/CarCard';
import { ScreenState } from '../../components/common/ScreenState';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Heights, Radius, Spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTimeVN } from '../../utils/dateUtils';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;
  route: RouteProp<MainTabParamList, 'Search'>;
};

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'createdAt' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

type CapacityFilter = '4-5' | '7' | 'other';
type PriceFilter = 'under500' | '500to2500' | 'over2500';

type AdvancedFilters = {
  brands: string[];
  carTypes: string[];
  capacity: CapacityFilter | null;
  colors: string[];
  price: PriceFilter | null;
};

const BRAND_OPTIONS = ['VinFast', 'Toyota', 'Mazda', 'Kia', 'Hyundai', 'Honda'];
const ALL_BRAND_OPTIONS = [
  ...BRAND_OPTIONS,
  'Ford',
  'Mitsubishi',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Lexus',
];
const BRAND_LOGOS: Record<string, ImageSourcePropType> = {
  VinFast: require('../../../assets/brands/vinfast.png'),
  Toyota: require('../../../assets/brands/toyota.png'),
  Mazda: require('../../../assets/brands/mazda.png'),
  Kia: require('../../../assets/brands/kia.png'),
  Hyundai: require('../../../assets/brands/hyundai.png'),
  Honda: require('../../../assets/brands/honda.png'),
  Ford: require('../../../assets/brands/ford.png'),
  Mitsubishi: require('../../../assets/brands/mitsubishi.png'),
  'Mercedes-Benz': require('../../../assets/brands/mercedes.png'),
  BMW: require('../../../assets/brands/bmw.png'),
  Audi: require('../../../assets/brands/audi.png'),
  Lexus: require('../../../assets/brands/lexus.png'),
};
const CAR_TYPE_OPTIONS = ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Pickup', 'MPV', 'Van'];
const COLOR_OPTIONS = [
  { label: 'Đen', value: 'black', color: '#111827' },
  { label: 'Trắng', value: 'white', color: '#ffffff' },
  { label: 'Đỏ', value: 'red', color: '#e52535' },
  { label: 'Xám', value: 'gray', color: '#94a3b8' },
  { label: 'Xanh', value: 'blue', color: '#0b5bd3' },
  { label: 'Nâu', value: 'brown', color: '#964B00' },
];

const emptyAdvancedFilters: AdvancedFilters = {
  brands: [],
  carTypes: [],
  capacity: null,
  colors: [],
  price: null,
};

const hasAdvancedFilters = (filters: AdvancedFilters) =>
  filters.brands.length > 0 ||
  filters.carTypes.length > 0 ||
  filters.capacity !== null ||
  filters.colors.length > 0 ||
  filters.price !== null;

const normalizeText = (value: string) => value.trim().toLowerCase();

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortValue>('createdAt');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortCars = (data: Car[], sortValue: SortValue = selectedSort) => {
    if (sortValue === 'price_asc') return [...data].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortValue === 'price_desc') return [...data].sort((a, b) => b.pricePerHour - a.pricePerHour);
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filterCars = (data: Car[], filters: AdvancedFilters) => {
    if (!hasAdvancedFilters(filters)) return data;

    return data.filter((car) => {
      const brandMatch =
        filters.brands.length === 0 ||
        filters.brands.some((brand) => normalizeText(car.brand) === normalizeText(brand));
      const typeMatch =
        filters.carTypes.length === 0 ||
        filters.carTypes.some((type) => normalizeText(car.carType).includes(normalizeText(type)));
      const colorMatch =
        filters.colors.length === 0 ||
        filters.colors.some((color) => normalizeText(car.color).includes(color));
      const capacityMatch =
        !filters.capacity ||
        (filters.capacity === '4-5'
          ? car.capacity >= 4 && car.capacity <= 5
          : filters.capacity === '7'
            ? car.capacity === 7
            : car.capacity < 4 || car.capacity > 7);
      const priceMatch =
        !filters.price ||
        (filters.price === 'under500'
          ? car.pricePerHour < 500000
          : filters.price === '500to2500'
            ? car.pricePerHour >= 500000 && car.pricePerHour <= 2500000
            : car.pricePerHour > 2500000);

      return brandMatch && typeMatch && colorMatch && capacityMatch && priceMatch;
    });
  };

  const quickSearchParams = route.params;

  const handleSearch = async (
    sortValue: SortValue = selectedSort,
    forceAll = false,
    filters: AdvancedFilters = advancedFilters
  ) => {
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
      const data =
        quickSearchParams?.pickUpAt && quickSearchParams.dropOffAt
          ? await carApi.fetchAvailableCars(quickSearchParams.pickUpAt, quickSearchParams.dropOffAt)
          : await carApi.fetchCars(params);
      setCars(sortCars(filterCars(data, filters), sortValue));
    } catch (err) {
      setCars([]);
      setError(getApiErrorMessage(err, 'Không thể tìm kiếm xe.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quickSearchParams?.pickUpAt && quickSearchParams.dropOffAt) {
      handleSearch(selectedSort, false, advancedFilters);
    }
  }, [quickSearchParams?.pickUpAt, quickSearchParams?.dropOffAt]);

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

  const toggleArrayFilter = (key: 'brands' | 'carTypes' | 'colors', value: string) => {
    setDraftFilters((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      };
    });
  };

  const openAdvancedFilters = () => {
    setDraftFilters(advancedFilters);
    setShowAllBrands(false);
    setIsFilterOpen(true);
  };

  const resetAdvancedFilters = () => {
    setDraftFilters(emptyAdvancedFilters);
    setAdvancedFilters(emptyAdvancedFilters);
    if (hasSearched) handleSearch(selectedSort, false, emptyAdvancedFilters);
    setIsFilterOpen(false);
  };

  const applyAdvancedFilters = () => {
    setAdvancedFilters(draftFilters);
    setIsFilterOpen(false);
    handleSearch(selectedSort, false, draftFilters);
  };

  const activeFilterCount =
    advancedFilters.brands.length +
    advancedFilters.carTypes.length +
    advancedFilters.colors.length +
    (advancedFilters.capacity ? 1 : 0) +
    (advancedFilters.price ? 1 : 0);
  const visibleBrandOptions = showAllBrands ? ALL_BRAND_OPTIONS : BRAND_OPTIONS;

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Tìm kiếm xe</Text>
        {quickSearchParams?.pickUpAt && quickSearchParams.dropOffAt && (
          <View style={styles.quickSearchSummary}>
            <View style={styles.quickSearchSummaryRow}>
              <Ionicons name="location-outline" size={16} color={Colors.primaryContainer} />
              <Text style={styles.quickSearchSummaryText} numberOfLines={1}>
                {quickSearchParams.location || 'Địa điểm nhận xe'}
              </Text>
            </View>
            <Text style={styles.quickSearchSummaryDate} numberOfLines={1}>
              {formatDateTimeVN(quickSearchParams.pickUpAt)} - {formatDateTimeVN(quickSearchParams.dropOffAt)}
            </Text>
          </View>
        )}
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
            <TouchableOpacity style={styles.searchIconButton} onPress={() => handleSearch()} activeOpacity={0.82}>
              <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>

        <TouchableOpacity style={styles.advancedFilterButton} onPress={openAdvancedFilters} activeOpacity={0.82}>
          <Ionicons name="options-outline" size={20} color={Colors.primaryContainer} />
          <Text style={styles.advancedFilterText}>Bộ lọc nâng cao</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

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

      <Modal visible={isFilterOpen} transparent animationType="slide" onRequestClose={() => setIsFilterOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsFilterOpen(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity style={styles.sheetCloseButton} onPress={() => setIsFilterOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Hãng xe</Text>
                  <TouchableOpacity onPress={() => setShowAllBrands((value) => !value)} activeOpacity={0.75}>
                    <Text style={styles.viewAllText}>{showAllBrands ? 'Thu gọn' : 'Xem tất cả'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.brandGrid}>
                  {visibleBrandOptions.map((brand) => {
                    const selected = draftFilters.brands.includes(brand);
                    return (
                      <TouchableOpacity key={brand} style={[styles.brandOption, selected && styles.optionActive]} onPress={() => toggleArrayFilter('brands', brand)} activeOpacity={0.78}>
                        {selected && (
                          <View style={styles.optionCheck}>
                            <Ionicons name="checkmark" size={12} color={Colors.onPrimary} />
                          </View>
                        )}
                        <Image
                          source={BRAND_LOGOS[brand]}
                          style={[styles.brandLogo, brand === 'Honda' && styles.hondaBrandLogo]}
                          resizeMode="contain"
                        />
                        <Text style={[styles.brandOptionText, selected && styles.optionTextActive]}>{brand}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Loại xe</Text>
                <View style={styles.chipWrap}>
                  {CAR_TYPE_OPTIONS.map((type) => {
                    const selected = draftFilters.carTypes.includes(type);
                    return (
                      <TouchableOpacity key={type} style={[styles.filterChip, selected && styles.optionActive]} onPress={() => toggleArrayFilter('carTypes', type)}>
                        <Text style={[styles.filterChipText, selected && styles.optionTextActive]}>{type}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Số chỗ ngồi</Text>
                <View style={styles.segmentRow}>
                  {[
                    { label: '4 - 5 chỗ', value: '4-5' },
                    { label: '7 chỗ', value: '7' },
                    { label: 'Khác', value: 'other' },
                  ].map((option) => {
                    const selected = draftFilters.capacity === option.value;
                    return (
                      <TouchableOpacity key={option.value} style={[styles.segmentOption, selected && styles.optionActive]} onPress={() => setDraftFilters((current) => ({ ...current, capacity: selected ? null : (option.value as CapacityFilter) }))}>
                        <Text style={[styles.segmentText, selected && styles.optionTextActive]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Màu sắc</Text>
                <View style={styles.colorRow}>
                  {COLOR_OPTIONS.map((item) => {
                    const selected = draftFilters.colors.includes(item.value);
                    return (
                      <TouchableOpacity key={item.value} style={[styles.colorOption, selected && styles.colorOptionActive]} onPress={() => toggleArrayFilter('colors', item.value)}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.color }, item.value === 'white' && styles.whiteSwatch]}>
                          {selected && <Ionicons name="checkmark" size={16} color={item.value === 'white' ? Colors.onSurface : Colors.onPrimary} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Mức giá theo giờ</Text>
                <View style={styles.segmentRow}>
                  {[
                    { label: '< 500k', value: 'under500' },
                    { label: '500k\n-\n2.500k', value: '500to2500' },
                    { label: '> 2.500k', value: 'over2500' },
                  ].map((option) => {
                    const selected = draftFilters.price === option.value;
                    return (
                      <TouchableOpacity key={option.value} style={[styles.segmentOption, selected && styles.optionActive]} onPress={() => setDraftFilters((current) => ({ ...current, price: selected ? null : (option.value as PriceFilter) }))}>
                        <Text style={[styles.segmentText, selected && styles.optionTextActive]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.clearFilterButton} onPress={resetAdvancedFilters}>
                <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterButton} onPress={applyAdvancedFilters} activeOpacity={0.86}>
                <Text style={styles.applyFilterText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 42,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  quickSearchSummary: {
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  quickSearchSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  quickSearchSummaryText: {
    flex: 1,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.primaryContainer,
  },
  quickSearchSummaryDate: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: Heights.input,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  searchIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedFilterButton: {
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  advancedFilterText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.primaryContainer,
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.labelSmBold,
    color: Colors.onPrimary,
  },
  sortRow: { marginBottom: 0 },
  sortChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
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
  results: { flex: 1 },
  resultsContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.stackMd,
    paddingBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  filterSheet: {
    maxHeight: '88%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: 8,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  sheetTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 18,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  viewAllText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.primaryContainer,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandOption: {
    width: '31%',
    minHeight: 76,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  brandLogo: {
    width: 34,
    height: 34,
  },
  hondaBrandLogo: {
    width: 48,
    height: 34,
  },
  optionActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: '#eef4ff',
  },
  optionCheck: {
    position: 'absolute',
    top: -7,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandOptionText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  optionTextActive: {
    fontFamily: FontFamilies.sansSemiBold,
    color: Colors.primaryContainer,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterChipText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentText: {
    flexShrink: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
  },
  colorOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteSwatch: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  sheetFooter: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 14,
    paddingBottom: 28,
  },
  clearFilterButton: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  applyFilterButton: {
    flex: 1.5,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
});
