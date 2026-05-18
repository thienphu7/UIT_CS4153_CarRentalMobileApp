/**
 * Format a Date object to ISO string for API requests
 * Backend expects ISO 8601: "2024-12-25T10:00:00.000Z"
 */
export const toISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Format date for display in Vietnamese locale
 * Example: "16/05/2026"
 */
export const formatDateVN = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date + time for display
 * Example: "16/05/2026 10:00"
 */
export const formatDateTimeVN = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate number of hours between two ISO date strings
 */
export const calcHours = (pickUpAt: string, dropOffAt: string): number => {
  const pick = new Date(pickUpAt).getTime();
  const drop = new Date(dropOffAt).getTime();
  return Math.max(1, Math.round((drop - pick) / (1000 * 60 * 60)));
};

/**
 * Calculate total rental amount
 */
export const calcTotalAmount = (
  pricePerHour: number,
  pickUpAt: string,
  dropOffAt: string
): number => {
  const hours = calcHours(pickUpAt, dropOffAt);
  return pricePerHour * hours;
};
