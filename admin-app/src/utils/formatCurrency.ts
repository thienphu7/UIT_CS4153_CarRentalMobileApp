/**
 * Format a number as Vietnamese Dong currency.
 * Example: 150000 -> "150.000 ₫"
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPricePerHour = (pricePerHour: number): string => {
  return `${formatVND(pricePerHour)}/giờ`;
};
