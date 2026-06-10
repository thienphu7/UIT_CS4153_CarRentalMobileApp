import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow } from '../../theme/spacing';

interface AdminMetricCardProps {
  label: string;
  value: string;
  icon: string;
  tone?: 'primary' | 'warning' | 'success' | 'neutral';
}

const toneColor = {
  primary: Colors.primaryContainer,
  warning: '#b45309',
  success: '#047857',
  neutral: Colors.onSurfaceVariant,
};

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  label,
  value,
  icon,
  tone = 'primary',
}) => (
  <View style={[styles.card, Shadow.card]}>
    <View style={[styles.iconWrap, { backgroundColor: tone === 'primary' ? Colors.primaryFixed : Colors.surfaceContainerHigh }]}>
      <Ionicons name={icon as any} size={18} color={toneColor[tone]} />
    </View>
    <Text style={styles.value} numberOfLines={1}>
      {value}
    </Text>
    <Text style={styles.label} numberOfLines={2}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: FontFamilies.numericBold,
    fontSize: FontSizes.priceDisplay,
    lineHeight: 28,
    color: Colors.onSurface,
    marginTop: 10,
  },
  label: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
});
