import React, { useEffect } from 'react';
import {
  ImageBackground,
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useCarStore } from '../../store/carStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
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
const quickSearchBackground = require('../../../assets/home-blue-car.jpg');

const getGreetingByHour = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 13) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

const formatQuickDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getDate()} Tháng ${date.getMonth() + 1}`;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { email } = useAuthStore();
  const profile = useProfileStore((state) => state.getProfile(email));
  const { cars, isLoading, fetchCars } = useCarStore();
  const [selectedType, setSelectedType] = React.useState('Tất cả');
  const [refreshing, setRefreshing] = React.useState(false);
  const displayName = profile.fullName?.trim() || getDisplayNameFromEmail(email);
  const avatarLetter = (displayName || 'Bạn').charAt(0).toUpperCase();
  const greeting = getGreetingByHour();
  const pickUpDate = formatQuickDate(1);
  const dropOffDate = formatQuickDate(4);
  const getQuickRentalWindow = () => {
    const pickUp = new Date();
    pickUp.setDate(pickUp.getDate() + 1);
    pickUp.setHours(9, 0, 0, 0);

    const dropOff = new Date(pickUp);
    dropOff.setDate(dropOff.getDate() + 3);

    return {
      pickUpAt: pickUp.toISOString(),
      dropOffAt: dropOff.toISOString(),
    };
  };
  const openQuickRentalSearch = () => {
    const rentalWindow = getQuickRentalWindow();
    navigation.navigate('QuickRentalSearch', {
      location: 'Hồ Chí Minh',
      pickUpAt: rentalWindow.pickUpAt,
      dropOffAt: rentalWindow.dropOffAt,
    });
  };

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
        <View style={styles.topBar}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              {email ? (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              ) : (
                <Ionicons name="person-outline" size={24} color={Colors.primaryContainer} />
              )}
            </View>
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingLabel}>{greeting}</Text>
              <Text style={styles.greetingName} numberOfLines={1}>{displayName || 'Bạn'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.78}>
            <Ionicons name="notifications-outline" size={24} color={Colors.onSurface} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <ImageBackground source={quickSearchBackground} style={styles.quickSearchCard} imageStyle={styles.quickSearchImage}>
          <View style={styles.quickSearchOverlay} />
          <Text style={styles.quickSearchTitle}>Bạn muốn thuê xe ở đâu?</Text>
          <TouchableOpacity style={styles.locationField} onPress={openQuickRentalSearch} activeOpacity={0.82}>
            <Ionicons name="location-outline" size={24} color={Colors.outline} />
            <Text style={styles.locationText}>Hồ Chí Minh</Text>
          </TouchableOpacity>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateField} onPress={openQuickRentalSearch} activeOpacity={0.82}>
              <Text style={styles.dateLabel}>Nhận xe</Text>
              <Text style={styles.dateValue}>{pickUpDate}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateField} onPress={openQuickRentalSearch} activeOpacity={0.82}>
              <Text style={styles.dateLabel}>Trả xe</Text>
              <Text style={styles.dateValue}>{dropOffDate}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.quickSearchButton} onPress={openQuickRentalSearch} activeOpacity={0.86}>
            <Text style={styles.quickSearchButtonText}>Tìm xe ngay</Text>
          </TouchableOpacity>
        </ImageBackground>
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
  content: { paddingBottom: Spacing.containerVerticalPadding + Spacing.stackMd },
  header: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 2,
    paddingBottom: Spacing.containerVerticalPadding / 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamilies.sansBold,
    fontSize: 19,
    color: Colors.primaryContainer,
  },
  greetingBlock: {
    flex: 1,
    minWidth: 0,
  },
  greetingLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
  greetingName: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notificationDot: {
    position: 'absolute',
    right: 12,
    top: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.error,
  },
  quickSearchCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: 14,
    minHeight: 206,
    justifyContent: 'flex-end',
    backgroundColor: Colors.primaryContainer,
  },
  quickSearchImage: {
    borderRadius: Radius.xl,
  },
  quickSearchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 82, 216, 0.74)',
  },
  quickSearchTitle: {
    fontFamily: FontFamilies.sansBold,
    fontSize: 21,
    lineHeight: 25,
    color: Colors.onPrimary,
    marginBottom: 8,
  },
  locationField: {
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  locationText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurfaceVariant,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  dateField: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dateLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.outline,
    marginBottom: 1,
  },
  dateValue: {
    fontFamily: FontFamilies.sansBold,
    fontSize: 15,
    lineHeight: 19,
    color: Colors.onSurface,
  },
  quickSearchButton: {
    height: 42,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSearchButtonText: {
    fontFamily: FontFamilies.sansBold,
    fontSize: 16,
    color: Colors.primaryContainer,
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
    paddingBottom: Spacing.containerVerticalPadding / 2,
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
