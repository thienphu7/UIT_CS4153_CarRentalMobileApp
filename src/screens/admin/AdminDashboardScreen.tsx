import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { carApi, Car } from '../../api/car.api';
import { rentalApi, Rental } from '../../api/rental.api';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatVND } from '../../utils/formatCurrency';

type Props = { navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'> };

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { email, logout } = useAuthStore();
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [carList, rentalList] = await Promise.all([
      carApi.fetchCars({ limit: 100 }),
      rentalApi.fetchAdminRentals(),
    ]);
    setCars(carList);
    setRentals(rentalList);
  }, []);

  useEffect(() => {
    loadData().catch(() => Alert.alert('Lỗi tải dữ liệu', 'Không thể kết nối tới API quản trị.'));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData().finally(() => setRefreshing(false));
  };

  const revenue = rentals.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const pendingCount = rentals.filter((item) => item.rentalStatus === 'PENDING').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Admin</Text>
          <Text style={styles.title}>Bảng điều khiển</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          { label: 'Tổng xe', value: cars.length.toString(), icon: 'car-sport-outline' },
          { label: 'Đơn thuê', value: rentals.length.toString(), icon: 'receipt-outline' },
          { label: 'Chờ duyệt', value: pendingCount.toString(), icon: 'time-outline' },
          { label: 'Doanh thu', value: formatVND(revenue), icon: 'cash-outline' },
        ]}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(item) => item.label}
        ListFooterComponent={
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.action, Shadow.card]} onPress={() => navigation.navigate('AdminCars')}>
              <Ionicons name="car-outline" size={22} color={Colors.primaryContainer} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Quản lý xe</Text>
                <Text style={styles.actionSubtitle}>Thêm, sửa, bảo trì hoặc xóa mềm xe</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.action, Shadow.card]} onPress={() => navigation.navigate('AdminRentals')}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primaryContainer} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Quản lý đơn thuê</Text>
                <Text style={styles.actionSubtitle}>Theo dõi booking từ khách hàng</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.metric, Shadow.card]}>
            <Ionicons name={item.icon as any} size={22} color={Colors.primaryContainer} />
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 58, paddingHorizontal: Spacing.containerPadding, paddingBottom: 18, backgroundColor: Colors.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.labelSm, color: Colors.primaryContainer, textTransform: 'uppercase' },
  title: { fontFamily: FontFamilies.displayBold, fontSize: FontSizes.h1Display, color: Colors.onSurface },
  email: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.bodyMain, color: Colors.onSurfaceVariant, marginTop: 4 },
  iconButton: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.containerPadding, paddingBottom: 40 },
  gridRow: { gap: Spacing.gridGutter },
  metric: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginBottom: Spacing.gridGutter },
  metricValue: { fontFamily: FontFamilies.displayBold, fontSize: FontSizes.priceDisplay, color: Colors.onSurface, marginTop: 12 },
  metricLabel: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant, marginTop: 4 },
  actions: { marginTop: Spacing.stackMd, gap: Spacing.stackMd },
  action: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionText: { flex: 1 },
  actionTitle: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.bodySemibold, color: Colors.onSurface },
  actionSubtitle: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
});
