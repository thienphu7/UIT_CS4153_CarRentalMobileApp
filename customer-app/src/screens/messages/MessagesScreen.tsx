import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export const MessagesScreen: React.FC = () => (
  <View style={styles.container}>
    <Ionicons name="chatbubbles-outline" size={64} color={Colors.outlineVariant} />
    <Text style={styles.title}>Tin nhắn</Text>
    <Text style={styles.subtitle}>
      Tính năng nhắn tin sẽ được cập nhật trong phiên bản tới
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
    gap: 12,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
