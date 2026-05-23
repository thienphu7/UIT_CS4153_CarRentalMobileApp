import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useCarStore } from '../../store/carStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { BookingStepIndicator } from '../../components/booking/BookingStepIndicator';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { formatPricePerHour } from '../../utils/formatCurrency';
import { getCarDescription } from '../../utils/carDescription';
import { Ionicons } from '@expo/vector-icons';

type CarDetailScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CarDetail'>;
  route: RouteProp<MainStackParamList, 'CarDetail'>;
};

const SpecItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.specItem}>
    <Ionicons name={icon as any} size={20} color={Colors.primaryContainer} />
    <View style={styles.specText}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

export const CarDetailScreen: React.FC<CarDetailScreenProps> = ({ navigation, route }) => {
  const { carId } = route.params;
  const { selectedCar, isLoading, fetchCarById } = useCarStore();
  const { isAuthenticated, email } = useAuthStore();
  const isVerificationComplete = useProfileStore((state) => state.isVerificationComplete(email));

  useEffect(() => {
    fetchCarById(carId);
  }, [carId]);

  if (isLoading || !selectedCar) return <LoadingOverlay />;

  const car = selectedCar;
  const isAvailable = car.status === 'AVAILABLE';
  const description = getCarDescription(car);
  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { redirectTo: 'Payment', carId: car.id });
      return;
    }

    if (!isVerificationComplete) {
      navigation.navigate('DocumentVerification', { redirectTo: 'Payment', carId: car.id });
      return;
    }

    navigation.navigate('Payment', { carId: car.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroFrame}>
          {car.imagePath ? (
            <Image source={{ uri: car.imagePath }} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <View style={[styles.heroImage, styles.heroFallback]}>
              <Ionicons name="car-sport-outline" size={64} color={Colors.primaryContainer} />
            </View>
          )}
        </View>

        {/* Main Info */}
        <View style={styles.content}>
          <BookingStepIndicator currentStep={1} />

          {/* Title & Price */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.model}>{car.model}</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
                {formatPricePerHour(car.pricePerHour)}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#d1fae5' : Colors.errorContainer }]}>
            <Text style={[styles.statusText, { color: isAvailable ? '#065f46' : Colors.error }]}>
              {isAvailable ? 'Có thể đặt' : 'Không có sẵn'}
            </Text>
          </View>

          {/* Specs Grid */}
          <View style={styles.specsCard}>
            <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
            <View style={styles.specsGrid}>
              <SpecItem icon="people-outline" label="Số chỗ" value={`${car.capacity} chỗ`} />
              <SpecItem icon="settings-outline" label="Loại xe" value={car.carType} />
              <SpecItem icon="calendar-outline" label="Năm SX" value={`${car.manufactureYear}`} />
              <SpecItem icon="color-palette-outline" label="Màu sắc" value={car.color} />
              <SpecItem icon="speedometer-outline" label="Số km" value={`${car.mileage.toLocaleString()} km`} />
              <SpecItem icon="id-card-outline" label="Biển số" value={car.licensePlate} />
            </View>
          </View>

          {/* Description */}
          <View style={styles.descCard}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Giá thuê</Text>
          <Text style={styles.bottomPriceValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
            {formatPricePerHour(car.pricePerHour)}
          </Text>
        </View>
        <Button
          title="Đặt xe ngay"
          onPress={handleBookNow}
          disabled={!isAvailable}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 8 },
  heroFrame: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: 14,
  },
  heroImage: {
    width: '100%',
    height: 226,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
  },
  heroFallback: { backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.containerPadding, paddingTop: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleLeft: { flex: 1, minWidth: 0, marginRight: 12 },
  brand: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  model: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  priceBlock: { alignItems: 'flex-end', flexShrink: 1, maxWidth: '42%' },
  price: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  statusText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
  },
  specsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    ...Shadow.card,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
    minWidth: 0,
  },
  specText: { flex: 1, minWidth: 0 },
  specLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  specValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  descCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: Spacing.stackMd,
    ...Shadow.card,
  },
  description: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  bottomSpacer: { height: 132 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 32,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    gap: 16,
    ...Shadow.bottomNav,
  },
  bottomPrice: { flex: 0.95, minWidth: 0 },
  bottomPriceLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  bottomPriceValue: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
  },
  bookButton: { flex: 1.25 },
});
