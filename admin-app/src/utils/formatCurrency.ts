const HOURLY_PRICE_DIVISOR = 24;
const PRICE_ROUNDING_UNIT = 10000;

export const roundToNearestTenThousand = (amount = 0): number => {
  return Math.round(amount / PRICE_ROUNDING_UNIT) * PRICE_ROUNDING_UNIT;
};

export const getHourlyPriceFromDaily = (pricePerDay = 0): number => {
  return roundToNearestTenThousand(pricePerDay / HOURLY_PRICE_DIVISOR);
};

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

/**
 * Car prices are stored as daily values, then displayed as rounded hourly rates.
 */
export const formatPricePerHour = (pricePerDay: number): string => {
  return `${formatVND(getHourlyPriceFromDaily(pricePerDay))}/giờ`;
};
