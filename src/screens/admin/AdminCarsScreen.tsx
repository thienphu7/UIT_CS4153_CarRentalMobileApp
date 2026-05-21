import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { carApi, Car, CarStatus, CreateCarPayload } from '../../api/car.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatPricePerHour } from '../../utils/formatCurrency';

const EMPTY_FORM: CreateCarPayload = {
  brand: '',
  model: '',
  carType: '',
  color: '',
  licensePlate: '',
  manufactureYear: new Date().getFullYear(),
  pricePerHour: 0,
  capacity: 4,
  mileage: 0,
  status: 'AVAILABLE',
  description: '',
  imagePath: '',
  publicImageId: '',
};

const STATUSES: CarStatus[] = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];

export const AdminCarsScreen: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CreateCarPayload>(EMPTY_FORM);

  const loadCars = useCallback(async () => {
    const data = await carApi.fetchCars({ limit: 100 });
    setCars(data.filter((car) => car.status !== 'DELETED'));
  }, []);

  useEffect(() => {
    loadCars().catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách xe.'));
  }, [loadCars]);

  const openCreate = () => {
    setEditingCar(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setModalVisible(true);
    setForm({
      brand: car.brand,
      model: car.model,
      carType: car.carType,
      color: car.color,
      licensePlate: car.licensePlate,
      manufactureYear: car.manufactureYear,
      pricePerHour: car.pricePerHour,
      capacity: car.capacity,
      mileage: car.mileage,
      status: car.status,
      description: car.description ?? '',
      imagePath: car.imagePath ?? '',
      publicImageId: car.publicImageId ?? '',
    });
  };

  const updateField = (key: keyof CreateCarPayload, value: string) => {
    const numericKeys = ['manufactureYear', 'pricePerHour', 'capacity', 'mileage'];
    setForm((current) => ({
      ...current,
      [key]: numericKeys.includes(key) ? Number(value.replace(/[^0-9.]/g, '')) : value,
    }));
  };

  const saveCar = async () => {
    if (!form.brand || !form.model || !form.licensePlate || !form.carType) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập hãng xe, mẫu xe, loại xe và biển số.');
      return;
    }

    setSaving(true);
    try {
      if (editingCar) await carApi.updateCar(editingCar.id, form);
      else await carApi.createCar(form);
      await loadCars();
      setEditingCar(null);
      setForm(EMPTY_FORM);
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Lưu xe thất bại', e?.response?.data?.message || 'Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCar = (car: Car) => {
    Alert.alert('Xóa xe', `Xóa mềm ${car.brand} ${car.model}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await carApi.deleteCar(car.id);
          await loadCars();
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars().finally(() => setRefreshing(false));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Button title="Thêm xe mới" onPress={openCreate} style={styles.addButton} />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, Shadow.card]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitle}>
                <Text style={styles.name}>{item.brand} {item.model}</Text>
                <Text style={styles.meta}>{item.licensePlate} - {item.carType} - {item.capacity} chỗ</Text>
              </View>
              <Text style={styles.price}>{formatPricePerHour(item.pricePerHour)}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.status}>{item.status}</Text>
              <View style={styles.rowActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => openEdit(item)}>
                  <Ionicons name="create-outline" size={18} color={Colors.primaryContainer} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => deleteCar(item)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingCar ? 'Sửa xe' : 'Thêm xe'}</Text>
            <TouchableOpacity onPress={() => { setEditingCar(null); setForm(EMPTY_FORM); setModalVisible(false); }}>
              <Ionicons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={[] as string[]}
            renderItem={() => null}
            ListHeaderComponent={
              <View>
                <Input label="Hãng xe" value={form.brand} onChangeText={(v) => updateField('brand', v)} />
                <Input label="Mẫu xe" value={form.model} onChangeText={(v) => updateField('model', v)} />
                <Input label="Loại xe" value={form.carType} onChangeText={(v) => updateField('carType', v)} />
                <Input label="Màu sắc" value={form.color} onChangeText={(v) => updateField('color', v)} />
                <Input label="Biển số" value={form.licensePlate} onChangeText={(v) => updateField('licensePlate', v)} />
                <Input label="Năm sản xuất" keyboardType="numeric" value={String(form.manufactureYear)} onChangeText={(v) => updateField('manufactureYear', v)} />
                <Input label="Giá mỗi giờ" keyboardType="numeric" value={String(form.pricePerHour)} onChangeText={(v) => updateField('pricePerHour', v)} />
                <Input label="Số chỗ" keyboardType="numeric" value={String(form.capacity)} onChangeText={(v) => updateField('capacity', v)} />
                <Input label="Số km" keyboardType="numeric" value={String(form.mileage)} onChangeText={(v) => updateField('mileage', v)} />
                <Text style={styles.label}>Trạng thái</Text>
                <View style={styles.statusRow}>
                  {STATUSES.map((status) => (
                    <TouchableOpacity key={status} style={[styles.statusChip, form.status === status && styles.statusChipActive]} onPress={() => setForm((current) => ({ ...current, status }))}>
                      <Text style={[styles.statusChipText, form.status === status && styles.statusChipTextActive]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input label="Mô tả" value={form.description ?? ''} onChangeText={(v) => updateField('description', v)} multiline />
                <Input label="URL ảnh" value={form.imagePath ?? ''} onChangeText={(v) => updateField('imagePath', v)} />
                <Button title="Lưu xe" onPress={saveCar} isLoading={saving} style={styles.saveButton} />
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.containerPadding, paddingBottom: 40 },
  addButton: { marginBottom: Spacing.stackMd },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginBottom: Spacing.stackMd },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { flex: 1 },
  name: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.h2Semibold, color: Colors.onSurface },
  meta: { fontFamily: FontFamilies.sansRegular, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant, marginTop: 4 },
  price: { fontFamily: FontFamilies.displayBold, fontSize: FontSizes.priceDisplay, color: Colors.primaryContainer },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  status: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.labelSm, color: Colors.primaryContainer },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.containerPadding, paddingTop: 58 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.stackMd },
  modalTitle: { fontFamily: FontFamilies.displayBold, fontSize: FontSizes.h1Display, color: Colors.onSurface },
  label: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant, marginBottom: 8, textTransform: 'uppercase' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusChip: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.surfaceContainerHigh },
  statusChipActive: { backgroundColor: Colors.primaryContainer },
  statusChipText: { fontFamily: FontFamilies.sansSemiBold, fontSize: FontSizes.labelSm, color: Colors.onSurfaceVariant },
  statusChipTextActive: { color: Colors.onPrimary },
  saveButton: { marginBottom: 40 },
});
