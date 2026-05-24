import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

type BookingSuccessScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'BookingSuccess'>;
  route: RouteProp<MainStackParamList, 'BookingSuccess'>;
};

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { rentalId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt xe thành công</Text>
      <Text style={styles.subtitle}>
        Đơn thuê xe của bạn đã được gửi đi.{'\n'}
        Vui lòng chờ nhân viên xác nhận trong vòng 24 giờ.
      </Text>

      <View style={styles.rentalIdCard}>
        <Text style={styles.rentalIdLabel}>Mã đơn thuê</Text>
        <Text style={styles.rentalId} numberOfLines={1}>
          #{rentalId.split('-')[0].toUpperCase()}
        </Text>
      </View>

      <Text style={styles.statusNote}>
        Trạng thái: <Text style={styles.statusPending}>Chờ xác nhận</Text>
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('HomeTabs')}
        >
          <Text style={styles.primaryButtonText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('HomeTabs', { screen: 'Rentals' })}
        >
          <Text style={styles.secondaryButtonText}>Xem đơn thuê của tôi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.stackLg,
  },
  rentalIdCard: {
    backgroundColor: Colors.primaryFixed,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.stackMd,
    width: '100%',
  },
  rentalIdLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onPrimaryFixed,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rentalId: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onPrimaryFixed,
    letterSpacing: 2,
  },
  statusNote: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sectionMargin,
  },
  statusPending: {
    fontFamily: FontFamilies.sansSemiBold,
    color: '#b45309',
  },
  actions: { width: '100%', gap: 12 },
  primaryButton: {
    height: 52,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onPrimary,
  },
  secondaryButton: {
    height: 52,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
});
