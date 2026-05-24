import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { carApi, Car, CarStatus, CreateCarPayload } from '../../api/car.api';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenState } from '../../components/common/ScreenState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { formatPricePerHour } from '../../utils/formatCurrency';
import { getApiErrorMessage } from '../../utils/apiError';

const createEmptyForm = (): CreateCarPayload => ({
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
});

const STATUS_OPTIONS: CarStatus[] = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];

const STATUS_META: Record<CarStatus, { label: string; color: string; bg: string; icon: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', color: '#047857', bg: '#d1fae5', icon: 'checkmark-circle-outline' },
  RENTED: { label: 'Đang thuê', color: Colors.primaryContainer, bg: Colors.primaryFixed, icon: 'car-sport-outline' },
  MAINTENANCE: { label: 'Bảo trì', color: '#b45309', bg: '#fef3c7', icon: 'construct-outline' },
  DELETED: { label: 'Đã ẩn', color: Colors.error, bg: Colors.errorContainer, icon: 'trash-outline' },
};

export const AdminCarsScreen: React.FC = () => {
  const { showToast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [activeStatus, setActiveStatus] = useState<CarStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<CreateCarPayload>(createEmptyForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateCarPayload, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const loadCars = useCallback(async (nextSearch = searchQuery, nextStatus = activeStatus) => {
    setError(null);
    const data = await carApi.fetchCars({
      limit: 100,
      search: nextSearch || undefined,
      carStatus: nextStatus === 'ALL' ? undefined : nextStatus,
    });
    setCars(data.filter((car) => car.status !== 'DELETED'));
  }, [activeStatus, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadCars()
        .catch((err) => {
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải danh sách xe.'));
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [loadCars])
  );

  const filteredCars = useMemo(() => cars, [cars]);

  const runSearch = async (nextSearch = searchText.trim(), nextStatus = activeStatus) => {
    setSearchQuery(nextSearch);
    setActiveStatus(nextStatus);
    setRefreshing(true);
    await loadCars(nextSearch, nextStatus)
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể tìm kiếm xe.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  const clearSearch = () => {
    setSearchText('');
    runSearch('', activeStatus);
  };

  const changeStatusFilter = (status: CarStatus | 'ALL') => {
    runSearch(searchText.trim(), status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars()
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể làm mới danh sách xe.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  const openCreate = () => {
    setEditingCar(null);
    setForm(createEmptyForm());
    setFormErrors({});
    setModalVisible(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setFormErrors({});
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
    setModalVisible(true);
  };

  const updateField = (key: keyof CreateCarPayload, value: string) => {
    const numericKeys: (keyof CreateCarPayload)[] = ['manufactureYear', 'pricePerHour', 'capacity', 'mileage'];
    setForm((current) => ({
      ...current,
      [key]: numericKeys.includes(key) ? Number(value.replace(/[^0-9.]/g, '')) : value,
    }));
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof CreateCarPayload, string>> = {};
    if (!form.brand.trim()) errors.brand = 'Nhập hãng xe';
    if (!form.model.trim()) errors.model = 'Nhập mẫu xe';
    if (!form.carType.trim()) errors.carType = 'Nhập loại xe';
    if (!form.color.trim()) errors.color = 'Nhập màu sắc';
    if (!form.licensePlate.trim()) errors.licensePlate = 'Nhập biển số';
    if (!form.manufactureYear || form.manufactureYear < 1990) errors.manufactureYear = 'Năm sản xuất không hợp lệ';
    if (!form.pricePerHour || form.pricePerHour <= 0) errors.pricePerHour = 'Giá mỗi giờ phải lớn hơn 0';
    if (!form.capacity || form.capacity <= 0) errors.capacity = 'Số chỗ không hợp lệ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveCar = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingCar) await carApi.updateCar(editingCar.id, form);
      else await carApi.createCar(form);
      showToast(editingCar ? 'Đã cập nhật xe.' : 'Đã tạo xe mới.', 'success');
      setModalVisible(false);
      setEditingCar(null);
      setForm(createEmptyForm());
      await loadCars();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Không thể lưu xe. Vui lòng kiểm tra dữ liệu.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateCarStatus = async (car: Car, status: CarStatus) => {
    try {
      await carApi.updateCar(car.id, { status });
      showToast(status === 'AVAILABLE' ? 'Xe đã được kích hoạt.' : 'Xe đã được chuyển trạng thái.', 'success');
      await loadCars();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Không thể cập nhật trạng thái xe.'), 'error');
    }
  };

  const deleteCar = async (car: Car) => {
    try {
      await carApi.deleteCar(car.id);
      showToast('Xe đã được ẩn khỏi danh sách.', 'success');
      await loadCars();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Không thể vô hiệu hóa xe.'), 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Quản lý xe" subtitle="Đang tải đội xe" actionIcon="add" onAction={openCreate} />
        <ScreenState type="loading" message="Đang lấy dữ liệu xe..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Quản lý xe" subtitle="Danh sách phương tiện" actionIcon="add" onAction={openCreate} />
        <ScreenState type="error" title="Không tải được xe" message={error} actionLabel="Thử lại" onAction={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Quản lý xe" subtitle={`${cars.length} xe đang quản trị`} actionIcon="add" onAction={openCreate} />
      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={Colors.outline} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm hãng, mẫu, biển số, loại xe..."
                placeholderTextColor={Colors.outline}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={() => runSearch()}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={clearSearch} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={Colors.outline} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.searchIconButton} onPress={() => runSearch()} activeOpacity={0.82}>
                <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {(['ALL', ...STATUS_OPTIONS] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, activeStatus === status && styles.filterChipActive]}
                  onPress={() => changeStatusFilter(status)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, activeStatus === status && styles.filterTextActive]}>
                    {status === 'ALL' ? 'Tất cả' : STATUS_META[status].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<ScreenState type="empty" icon="car-outline" title="Không có xe" message="Không có xe phù hợp với từ khóa hoặc bộ lọc hiện tại." />}
        renderItem={({ item }) => {
          const status = STATUS_META[item.status];
          return (
            <View style={[styles.card, Shadow.card]}>
              {item.imagePath ? (
                <Image source={{ uri: item.imagePath }} style={styles.carImage} resizeMode="cover" />
              ) : (
                <View style={styles.imageFallback}>
                  <Ionicons name="car-sport-outline" size={42} color={Colors.primaryContainer} />
                </View>
              )}
              <View style={styles.imageBadge}>
                <StatusBadge {...status} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.titleCopy}>
                    <Text style={styles.carName}>{item.brand} {item.model}</Text>
                    <Text style={styles.meta}>{item.carType} - {item.licensePlate} - {item.manufactureYear}</Text>
                  </View>
                  <Text style={styles.price}>{formatPricePerHour(item.pricePerHour)}</Text>
                </View>
                <View style={styles.specRow}>
                  <Spec icon="people-outline" value={`${item.capacity} chỗ`} />
                  <Spec icon="speedometer-outline" value={`${item.mileage.toLocaleString()} km`} />
                  <Spec icon="color-palette-outline" value={item.color} />
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openEdit(item)}>
                    <Ionicons name="create-outline" size={16} color={Colors.onSurface} />
                    <Text style={styles.actionText}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                  {item.status === 'MAINTENANCE' ? (
                    <TouchableOpacity style={styles.iconButton} onPress={() => updateCarStatus(item, 'AVAILABLE')}>
                      <Ionicons name="play-outline" size={16} color={Colors.primaryContainer} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.iconButton} onPress={() => updateCarStatus(item, 'MAINTENANCE')}>
                      <Ionicons name="pause-outline" size={16} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={() => deleteCar(item)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      <CarFormModal
        visible={modalVisible}
        editingCar={editingCar}
        form={form}
        errors={formErrors}
        saving={saving}
        onClose={() => {
          setModalVisible(false);
          setEditingCar(null);
          setForm(createEmptyForm());
        }}
        onSave={saveCar}
        onChange={updateField}
        onStatusChange={(status) => setForm((current) => ({ ...current, status }))}
      />
    </View>
  );
};

const Spec = ({ icon, value }: { icon: string; value: string }) => (
  <View style={styles.spec}>
    <Ionicons name={icon as any} size={13} color={Colors.primaryContainer} />
    <Text style={styles.specText}>{value}</Text>
  </View>
);

interface CarFormModalProps {
  visible: boolean;
  editingCar: Car | null;
  form: CreateCarPayload;
  errors: Partial<Record<keyof CreateCarPayload, string>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: keyof CreateCarPayload, value: string) => void;
  onStatusChange: (status: CarStatus) => void;
}

const CarFormModal: React.FC<CarFormModalProps> = ({
  visible,
  editingCar,
  form,
  errors,
  saving,
  onClose,
  onSave,
  onChange,
  onStatusChange,
}) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.modalHeader}>
        <View>
          <Text style={styles.modalKicker}>Phương tiện</Text>
          <Text style={styles.modalTitle}>{editingCar ? 'Sửa xe' : 'Thêm xe mới'}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Input label="Hãng xe" value={form.brand} onChangeText={(v) => onChange('brand', v)} error={errors.brand} />
        <Input label="Mẫu xe" value={form.model} onChangeText={(v) => onChange('model', v)} error={errors.model} />
        <Input label="Loại xe" value={form.carType} onChangeText={(v) => onChange('carType', v)} error={errors.carType} />
        <Input label="Màu sắc" value={form.color} onChangeText={(v) => onChange('color', v)} error={errors.color} />
        <Input label="Biển số" value={form.licensePlate} onChangeText={(v) => onChange('licensePlate', v)} error={errors.licensePlate} />
        <Input label="Năm sản xuất" keyboardType="numeric" value={String(form.manufactureYear || '')} onChangeText={(v) => onChange('manufactureYear', v)} error={errors.manufactureYear} />
        <Input label="Giá mỗi giờ" keyboardType="numeric" value={String(form.pricePerHour || '')} onChangeText={(v) => onChange('pricePerHour', v)} error={errors.pricePerHour} />
        <Input label="Số chỗ" keyboardType="numeric" value={String(form.capacity || '')} onChangeText={(v) => onChange('capacity', v)} error={errors.capacity} />
        <Input label="Số km" keyboardType="numeric" value={String(form.mileage || '')} onChangeText={(v) => onChange('mileage', v)} />
        <Text style={styles.formLabel}>Trạng thái</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusOption, form.status === status && styles.statusOptionActive]}
              onPress={() => onStatusChange(status)}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusOptionText, form.status === status && styles.statusOptionTextActive]}>
                {STATUS_META[status].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Mô tả" value={form.description ?? ''} onChangeText={(v) => onChange('description', v)} multiline />
        <Input label="URL ảnh" value={form.imagePath ?? ''} onChangeText={(v) => onChange('imagePath', v)} autoCapitalize="none" />
        <Button title={editingCar ? 'Lưu thay đổi' : 'Tạo xe'} onPress={onSave} isLoading={saving} style={styles.saveButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: Spacing.containerVerticalPadding + 76,
  },
  listHeader: {
    gap: 10,
    paddingBottom: Spacing.stackMd,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
  },
  searchIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    gap: 8,
  },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  filterChipActive: { backgroundColor: Colors.primaryContainer },
  filterText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  filterTextActive: { color: Colors.onPrimary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.stackMd,
  },
  carImage: {
    width: '100%',
    height: 166,
  },
  imageFallback: {
    width: '100%',
    height: 166,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cardBody: { padding: 14 },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleCopy: { flex: 1 },
  carName: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
  },
  meta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  price: {
    fontFamily: FontFamilies.numericBold,
    fontSize: FontSizes.priceDisplay,
    color: Colors.primaryContainer,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specText: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.primary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurface,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.errorContainer,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding * 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.stackMd,
  },
  modalKicker: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  modalTitle: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h1Display,
    color: Colors.onSurface,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLabel: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.stackMd,
  },
  statusOption: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusOptionActive: {
    backgroundColor: Colors.primaryContainer,
  },
  statusOptionText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  statusOptionTextActive: {
    color: Colors.onPrimary,
  },
  saveButton: {
    marginTop: Spacing.stackSm,
    marginBottom: 40,
  },
});
