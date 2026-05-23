import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatDateTimeVN, toISOString } from '../../utils/dateUtils';

type QuickRentalSearchScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'QuickRentalSearch'>;
  route: RouteProp<MainStackParamList, 'QuickRentalSearch'>;
};

const getDefaultDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(9, 0, 0, 0);
  return date;
};

export const QuickRentalSearchScreen: React.FC<QuickRentalSearchScreenProps> = ({
  navigation,
  route,
}) => {
  const [location, setLocation] = useState(route.params?.location ?? 'Hồ Chí Minh');
  const [pickUpAt, setPickUpAt] = useState(
    route.params?.pickUpAt ? new Date(route.params.pickUpAt) : getDefaultDate(1)
  );
  const [dropOffAt, setDropOffAt] = useState(
    route.params?.dropOffAt ? new Date(route.params.dropOffAt) : getDefaultDate(4)
  );
  const [showPickUp, setShowPickUp] = useState(false);
  const [showDropOff, setShowDropOff] = useState(false);

  const openAndroidDateTimePicker = (
    value: Date,
    minimumDate: Date,
    onConfirm: (date: Date) => void
  ) => {
    DateTimePickerAndroid.open({
      value,
      minimumDate,
      mode: 'date',
      onChange: (dateEvent: DateTimePickerEvent, selectedDate?: Date) => {
        if (dateEvent.type !== 'set' || !selectedDate) return;

        const nextDate = new Date(selectedDate);
        nextDate.setHours(value.getHours(), value.getMinutes(), 0, 0);

        setTimeout(() => {
          DateTimePickerAndroid.open({
            value: nextDate,
            mode: 'time',
            onChange: (timeEvent: DateTimePickerEvent, selectedTime?: Date) => {
              if (timeEvent.type !== 'set' || !selectedTime) return;

              const nextDateTime = new Date(nextDate);
              nextDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
              onConfirm(nextDateTime);
            },
          });
        }, 0);
      },
    });
  };

  const openPickUpPicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(pickUpAt, new Date(), setPickUpAt);
      return;
    }

    setShowPickUp(true);
  };

  const openDropOffPicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(dropOffAt, pickUpAt, setDropOffAt);
      return;
    }

    setShowDropOff(true);
  };

  const handleSearch = () => {
    if (!location.trim()) {
      Alert.alert('Thiếu địa điểm', 'Vui lòng nhập địa điểm nhận xe.');
      return;
    }

    if (dropOffAt <= pickUpAt) {
      Alert.alert('Thời gian không hợp lệ', 'Thời gian trả xe phải sau thời gian nhận xe.');
      return;
    }

    navigation.navigate('HomeTabs', {
      screen: 'Search',
      params: {
        location: location.trim(),
        pickUpAt: toISOString(pickUpAt),
        dropOffAt: toISOString(dropOffAt),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.summaryCard, Shadow.card]}>
          <Text style={styles.title}>Bạn muốn thuê xe ở đâu?</Text>
          <Text style={styles.subtitle}>
            Chọn địa điểm và thời gian để hệ thống tìm xe còn trống trong khung giờ đó.
          </Text>
        </View>

        <View style={styles.section}>
          <Input
            label="Địa điểm nhận xe"
            placeholder="VD: Hồ Chí Minh"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity style={[styles.datePicker, Shadow.card]} onPress={openPickUpPicker}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Nhận xe</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(pickUpAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {Platform.OS !== 'android' && showPickUp && (
            <DateTimePicker
              value={pickUpAt}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowPickUp(false);
                if (date) setPickUpAt(date);
              }}
            />
          )}

          <TouchableOpacity style={[styles.datePicker, Shadow.card]} onPress={openDropOffPicker}>
            <Ionicons name="flag-outline" size={20} color={Colors.primaryContainer} />
            <View style={styles.datePickerText}>
              <Text style={styles.datePickerLabel}>Trả xe</Text>
              <Text style={styles.datePickerValue}>{formatDateTimeVN(toISOString(dropOffAt))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>

          {Platform.OS !== 'android' && showDropOff && (
            <DateTimePicker
              value={dropOffAt}
              mode="datetime"
              minimumDate={pickUpAt}
              onChange={(_, date) => {
                setShowDropOff(false);
                if (date) setDropOffAt(date);
              }}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button title="Tìm xe phù hợp" onPress={handleSearch} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding + 90,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: Spacing.stackLg,
  },
  title: {
    fontFamily: FontFamilies.sansBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  section: { marginBottom: Spacing.stackLg },
  datePicker: {
    minHeight: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 12,
  },
  datePickerText: { flex: 1 },
  datePickerLabel: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  datePickerValue: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
    marginTop: 2,
  },
  bottomBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding + Spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
});
