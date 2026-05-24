import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface ScreenStateProps {
  type: 'loading' | 'empty' | 'error';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const ScreenState: React.FC<ScreenStateProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  const fallbackIcon = type === 'error' ? 'warning-outline' : 'albums-outline';

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={(icon || fallbackIcon) as any}
          size={34}
          color={type === 'error' ? Colors.error : Colors.primaryContainer}
        />
      </View>
      {title && <Text style={styles.title}>{title}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const SkeletonBlock: React.FC<{ height: number; width?: number | string; style?: object }> = ({
  height,
  width = '100%',
  style,
}) => <View style={[styles.skeleton, { height, width }, style]} />;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: 64,
    gap: 12,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  message: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 4,
  },
  actionText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
  skeleton: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainerHigh,
    opacity: 0.7,
  },
});
