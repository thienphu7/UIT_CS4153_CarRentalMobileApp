import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius } from '../../theme/spacing';

interface StatusBadgeProps {
  label: string;
  color?: string;
  bg?: string;
  icon?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color = Colors.primaryContainer,
  bg = Colors.primaryFixed,
  icon,
}) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    {icon && <Ionicons name={icon as any} size={13} color={color} />}
    <Text style={[styles.text, { color }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  text: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
  },
});
