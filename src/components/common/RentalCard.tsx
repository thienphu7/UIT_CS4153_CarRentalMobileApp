import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rental, RentalStatus } from '../../api/rental.api';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Spacing, Shadow } from '../../theme/spacing';
import { formatDateTimeVN } from '../../utils/dateUtils';
import { formatVND } from '../../utils/formatCurrency';

const STATUS_CONFIG: Record<
  RentalStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDING: { label: 'Chờ xác nhận', color: '#b45309', bg: '#fef3c7', icon: 'time-outline' },
  ACTIVE: { label: 'Đang thuê', color: '#065f46', bg: '#d1fae5', icon: 'car-sport-outline' },
  APPROVED: { label: 'Đã duyệt', color: Colors.primary, bg: Colors.primaryFixed, icon: 'checkmark-circle-outline' },
  REJECTED: { label: 'Bị từ chối', color: Colors.error, bg: Colors.errorContainer, icon: 'close-circle-outline' },
  COMPLETED: { label: 'Hoàn thành', color: '#374151', bg: Colors.surfaceContainerHighest, icon: 'flag-outline' },
  CANCELLED: { label: 'Đã hủy', color: Colors.error, bg: Colors.errorContainer, icon: 'ban-outline' },
};

interface RentalCardProps {
  rental: Rental;
  onPress?: (rental: Rental) => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({ rental, onPress }) => {
  const config = STATUS_CONFIG[rental.rentalStatus] ?? STATUS_CONFIG.PENDING;

  return (
    <View
      style={[styles.card, Shadow.card]}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      {/* Rental Info */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color={Colors.onSurfaceVariant} />
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Đón:</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {rental.pickUpLocation}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="flag-outline" size={16} color={Colors.onSurfaceVariant} />
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Trả:</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {rental.dropOffLocation}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Time */}
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Ngày đón</Text>
          <Text style={styles.timeValue}>{formatDateTimeVN(rental.pickUpAt)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.outline} />
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Ngày trả</Text>
          <Text style={styles.timeValue}>{formatDateTimeVN(rental.dropOffAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng tiền</Text>
        <Text style={styles.totalAmount}>{formatVND(rental.totalAmount)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: Spacing.stackMd,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    gap: 4,
  },
  statusText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  locationLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
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
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
});
