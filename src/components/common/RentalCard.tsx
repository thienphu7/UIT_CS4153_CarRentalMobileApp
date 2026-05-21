import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rental } from '../../api/rental.api';
import { RENTAL_STATUS_CONFIG } from '../../constants/rentalStatus';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Spacing, Shadow } from '../../theme/spacing';
import { formatDateTimeVN } from '../../utils/dateUtils';
import { formatVND } from '../../utils/formatCurrency';
import { getRentalAmount, getRentalRouteText } from '../../utils/rentalUtils';
import { StatusBadge } from './StatusBadge';

interface RentalCardProps {
  rental: Rental;
  onPress?: (rental: Rental) => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({ rental, onPress }) => {
  const config = RENTAL_STATUS_CONFIG[rental.rentalStatus] ?? RENTAL_STATUS_CONFIG.PENDING;

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.card]}
      onPress={() => onPress?.(rental)}
      activeOpacity={onPress ? 0.86 : 1}
      disabled={!onPress}
    >
      <StatusBadge {...config} />

      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.locationValue} numberOfLines={1}>{getRentalRouteText(rental)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Ngày nhận</Text>
          <Text style={styles.timeValue}>{formatDateTimeVN(rental.pickUpAt)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.outline} />
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Ngày trả</Text>
          <Text style={styles.timeValue}>{formatDateTimeVN(rental.dropOffAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng tiền</Text>
        <Text style={styles.totalAmount}>{formatVND(getRentalAmount(rental))}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: Spacing.stackMd,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  locationValue: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeBlock: { flex: 1 },
  timeLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  timeValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
  totalAmount: {
    fontFamily: FontFamilies.numericBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
});
