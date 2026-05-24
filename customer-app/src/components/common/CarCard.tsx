import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '../../api/car.api';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatPricePerHour } from '../../utils/formatCurrency';

interface CarCardProps {
  car: Car;
  onPress: (car: Car) => void;
  horizontal?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress, horizontal = false }) => {
  const isAvailable = car.status === 'AVAILABLE';

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.cardHorizontal, Shadow.card]}
        onPress={() => onPress(car)}
        activeOpacity={0.9}
      >
        <View style={styles.imageHorizontalFrame}>
          {car.imagePath ? (
            <Image source={{ uri: car.imagePath }} style={styles.imageHorizontal} resizeMode="contain" />
          ) : (
            <View style={[styles.imageHorizontal, styles.imageFallback]}>
              <Ionicons name="car-sport-outline" size={26} color={Colors.primaryContainer} />
            </View>
          )}
        </View>
        <View style={styles.infoHorizontal}>
          <Text style={styles.brandHorizontal} numberOfLines={1}>
            {car.brand}
          </Text>
          <Text style={styles.modelHorizontal} numberOfLines={1}>
            {car.model}
          </Text>
          <View style={styles.specRowHorizontal}>
            <SpecChip icon="people-outline" label={`${car.capacity} chỗ`} />
            <SpecChip icon="settings-outline" label={car.carType} />
          </View>
          <Text style={styles.priceHorizontal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
            {formatPricePerHour(car.pricePerHour)}
          </Text>
          {!isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Không có sẵn</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.card]}
      onPress={() => onPress(car)}
      activeOpacity={0.9}
    >
      <View style={styles.imageFrame}>
        {car.imagePath ? (
          <Image source={{ uri: car.imagePath }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Ionicons name="car-sport-outline" size={42} color={Colors.primaryContainer} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.brand} numberOfLines={1}>
              {car.brand}
            </Text>
            <Text style={styles.model} numberOfLines={1}>
              {car.model}
            </Text>
          </View>
          <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
            {formatPricePerHour(car.pricePerHour)}
          </Text>
        </View>
        <View style={styles.specRow}>
          <SpecChip icon="people-outline" label={`${car.capacity} chỗ`} />
          <SpecChip icon="settings-outline" label={car.carType} />
          <SpecChip icon="calendar-outline" label={`${car.manufactureYear}`} />
        </View>
        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Không có sẵn</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SpecChip = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.chip}>
    <Ionicons name={icon as any} size={12} color={Colors.primaryContainer} />
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  // Vertical card (default)
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.stackMd,
  },
  imageFrame: {
    height: 176,
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
  },
  imageFallback: {
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleLeft: { flex: 1, marginRight: 8 },
  brand: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  model: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  price: {
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
    flexShrink: 1,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.primary,
  },
  unavailableBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unavailableText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.error,
  },

  // Horizontal card
  cardHorizontal: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginRight: Spacing.gridGutter,
    width: 270,
    height: 266,
    marginBottom: 4,
  },
  imageHorizontalFrame: {
    height: 124,
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  imageHorizontal: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
  },
  infoHorizontal: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
    gap: 5,
  },
  brandHorizontal: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  modelHorizontal: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  specRowHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  priceHorizontal: {
    alignSelf: 'stretch',
    fontFamily: FontFamilies.numericBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.primaryContainer,
    textAlign: 'center',
  },
});
