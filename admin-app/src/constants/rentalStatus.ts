import { Colors } from '../theme/colors';
import type { RentalStatus } from '../api/rental.api';

export const RENTAL_STATUS_CONFIG: Record<
  RentalStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDING: { label: 'Chờ duyệt', color: '#b45309', bg: '#fef3c7', icon: 'time-outline' },
  APPROVED: { label: 'Đã duyệt', color: Colors.primary, bg: Colors.primaryFixed, icon: 'checkmark-circle-outline' },
  ACTIVE: { label: 'Đang thuê', color: '#065f46', bg: '#d1fae5', icon: 'car-sport-outline' },
  COMPLETED: { label: 'Hoàn thành', color: '#374151', bg: Colors.surfaceContainerHighest, icon: 'flag-outline' },
  REJECTED: { label: 'Từ chối', color: Colors.error, bg: Colors.errorContainer, icon: 'close-circle-outline' },
  CANCELLED: { label: 'Đã hủy', color: Colors.error, bg: Colors.errorContainer, icon: 'ban-outline' },
};

export const BOOKING_FILTERS: { label: string; status?: RentalStatus }[] = [
  { label: 'Tất cả' },
  { label: 'Chờ duyệt', status: 'PENDING' },
  { label: 'Đã duyệt', status: 'APPROVED' },
  { label: 'Đang thuê', status: 'ACTIVE' },
  { label: 'Hoàn thành', status: 'COMPLETED' },
  { label: 'Đã hủy', status: 'CANCELLED' },
];
