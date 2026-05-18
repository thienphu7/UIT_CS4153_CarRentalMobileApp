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
  const placeholderImage =
    'https://via.placeholder.com/390x200/efecff/3563e9?text=No+Image';

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.cardHorizontal, Shadow.card]}
        onPress={() => onPress(car)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: car.imagePath || placeholderImage }}
          style={styles.imageHorizontal}
          resizeMode="cover"
        />
        <View style={styles.infoHorizontal}>
          <Text style={styles.brand} numberOfLines={1}>
            {car.brand}
          </Text>
          <Text style={styles.model} numberOfLines={1}>
            {car.model}
          </Text>
          <View style={styles.specRow}>
            <SpecChip icon="people-outline" label={`${car.capacity} chỗ`} />
            <SpecChip icon="settings-outline" label={car.carType} />
          </View>
          <Text style={styles.price}>{formatPricePerHour(car.pricePerHour)}</Text>
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
      <Image
        source={{ uri: car.imagePath || placeholderImage }}
        style={styles.image}
        resizeMode="cover"
      />
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
          <Text style={styles.price}>{formatPricePerHour(car.pricePerHour)}</Text>
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
  image: {
    width: '100%',
    height: 180,
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
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
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
    flexDirection: 'row',
    overflow: 'hidden',
    marginRight: Spacing.gridGutter,
    width: 260,
  },
  imageHorizontal: {
    width: 100,
    height: '100%',
  },
  infoHorizontal: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
});
