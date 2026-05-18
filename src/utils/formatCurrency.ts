/**
 * Format a number as Vietnamese Dong currency
 * Example: 150000 → "150.000 ₫"
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price per hour display
 * Example: 75000 → "75.000 ₫/giờ"
 */
export const formatPricePerHour = (pricePerHour: number): string => {
  return `${formatVND(pricePerHour)}/giờ`;
};
