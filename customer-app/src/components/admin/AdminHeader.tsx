import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface AdminHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionIcon?: string;
  onAction?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  eyebrow = 'Quản lý',
  title,
  subtitle,
  actionIcon = 'notifications-outline',
  onAction,
}) => (
  <View style={styles.header}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>A</Text>
    </View>
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    <TouchableOpacity style={styles.iconButton} onPress={onAction} activeOpacity={0.8}>
      <Ionicons name={actionIcon as any} size={20} color={Colors.primaryContainer} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 3,
    paddingBottom: Spacing.containerVerticalPadding / 2,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.inverseSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.labelSmBold,
    color: Colors.inverseOnSurface,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    lineHeight: 34,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
