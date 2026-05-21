import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rentalApi, Rental } from '../../api/rental.api';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { ScreenState } from '../../components/common/ScreenState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import { RENTAL_STATUS_CONFIG } from '../../constants/rentalStatus';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/apiError';
import { getShortId } from '../../utils/rentalUtils';

interface ConversationPreview {
  customerId: string;
  latestRental: Rental;
  rentalCount: number;
}

export const AdminMessagesScreen: React.FC = () => {
  const { showToast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRentals = useCallback(async () => {
    setError(null);
    setRentals(await rentalApi.fetchAdminRentals());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadRentals()
        .catch((err) => {
          if (isActive) setError(getApiErrorMessage(err, 'Không thể tải cuộc trò chuyện.'));
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [loadRentals])
  );

  const conversations = useMemo<ConversationPreview[]>(() => {
    const grouped = new Map<string, Rental[]>();
    rentals.forEach((rental) => {
      const current = grouped.get(rental.customerId) ?? [];
      current.push(rental);
      grouped.set(rental.customerId, current);
    });

    return Array.from(grouped.entries()).map(([customerId, customerRentals]) => {
      const sorted = [...customerRentals].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return {
        customerId,
        latestRental: sorted[0],
        rentalCount: sorted.length,
      };
    });
  }, [rentals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRentals()
      .catch((err) => showToast(getApiErrorMessage(err, 'Không thể làm mới tin nhắn.'), 'error'))
      .finally(() => setRefreshing(false));
  };

  const openConversation = () => {
    showToast('Backend hiện chưa có endpoint nhắn tin. FE đang hiển thị cuộc trò chuyện theo booking thật.', 'info');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Tin nhắn khách hàng" subtitle="Đang tải liên hệ" />
        <ScreenState type="loading" message="Đang lấy dữ liệu booking..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Tin nhắn khách hàng" subtitle="Theo booking" />
        <ScreenState type="error" title="Không tải được tin nhắn" message={error} actionLabel="Thử lại" onAction={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Tin nhắn khách hàng" subtitle="Theo dõi trao đổi liên quan booking" />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.customerId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primaryContainer} />
            <Text style={styles.noticeText}>
              Chưa có API chat trong backend hiện tại; danh sách dưới đây được tạo từ booking thật.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <ScreenState type="empty" icon="chatbubbles-outline" title="Chưa có hội thoại" message="Khi có booking, khách hàng sẽ xuất hiện ở đây." />
        }
        renderItem={({ item }) => {
          const status = RENTAL_STATUS_CONFIG[item.latestRental.rentalStatus];
          return (
            <TouchableOpacity style={[styles.conversation, Shadow.card]} onPress={openConversation} activeOpacity={0.86}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getShortId(item.customerId).slice(0, 1)}</Text>
              </View>
              <View style={styles.copy}>
                <View style={styles.topRow}>
                  <Text style={styles.name} numberOfLines={1}>Khách #{getShortId(item.customerId)}</Text>
                  <Text style={styles.count}>{item.rentalCount} đơn</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  Booking gần nhất #{getShortId(item.latestRental.id)}
                </Text>
                <StatusBadge {...status} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 96,
    gap: Spacing.stackMd,
  },
  notice: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryFixed,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    lineHeight: 16,
    color: Colors.onPrimaryFixed,
  },
  conversation: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamilies.displayBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.primaryContainer,
  },
  copy: { flex: 1, gap: 6 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
  },
  count: {
    fontFamily: FontFamilies.numericSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
  },
  preview: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
  },
});
