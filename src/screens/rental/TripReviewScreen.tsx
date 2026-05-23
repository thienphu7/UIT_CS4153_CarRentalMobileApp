import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { rentalApi } from '../../api/rental.api';
import { Button } from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';
import { markRentalCancelledLocally } from '../../utils/localRentalOverrides';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

type TripReviewScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'TripReview'>;
  route: RouteProp<MainStackParamList, 'TripReview'>;
};

export const TripReviewScreen: React.FC<TripReviewScreenProps> = ({ navigation, route }) => {
  const { rentalId } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    Alert.alert(
      'Hủy đơn thuê',
      'Bạn có chắc chắn muốn hủy đơn thuê này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await rentalApi.updateRental(rentalId, { rentalStatus: 'CANCELLED' });
              await markRentalCancelledLocally(rentalId);
              Alert.alert('Thành công', 'Đơn thuê đã được hủy', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Lỗi', getApiErrorMessage(e, 'Không thể hủy đơn thuê'));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="document-text-outline" size={60} color={Colors.primaryContainer} />
      </View>

      <Text style={styles.title}>Chi tiết chuyến đi</Text>
      <Text style={styles.subtitle}>
        Mã đơn: #{rentalId.split('-')[0].toUpperCase()}
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Bạn có thể hủy đơn thuê nếu chuyến đi chưa được xác nhận hoặc chưa bắt đầu.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Hủy đơn thuê"
          onPress={handleCancel}
          isLoading={isLoading}
          variant="secondary"
          style={styles.cancelButton}
          textStyle={{ color: Colors.error }}
        />
        <Button
          title="Quay lại"
          onPress={() => navigation.goBack()}
          variant="primary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 40,
  },
  iconWrapper: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.stackLg,
  },
  title: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.stackLg,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: Spacing.sectionMargin,
  },
  infoText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  actions: { gap: 12 },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorContainer,
  },
});
