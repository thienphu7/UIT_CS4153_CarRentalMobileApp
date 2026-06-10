import type { Car } from '../api/car.api';
import type { Rental } from '../api/rental.api';
import { calcTotalAmount } from './dateUtils';

export const getRentalAmount = (rental: Rental, car?: Car | null) => {
  if (typeof rental.totalAmount === 'number') return rental.totalAmount;
  const rentalCar = car ?? rental.car;
  if (rentalCar) return calcTotalAmount(rentalCar.pricePerHour, rental.pickUpAt, rental.dropOffAt);
  return 0;
};

export const getRentalRouteText = (rental: Rental) => {
  const pickUp = rental.pickUpLocation?.trim() || 'Chưa có điểm nhận';
  const dropOff = rental.dropOffLocation?.trim() || 'Chưa có điểm trả';
  return `${pickUp} -> ${dropOff}`;
};

export const getShortId = (id: string) => id.split('-')[0].toUpperCase();

export const isPendingRental = (rental: Rental) => rental.rentalStatus === 'PENDING';

export const countByStatus = (rentals: Rental[], status: Rental['rentalStatus']) =>
  rentals.filter((rental) => rental.rentalStatus === status).length;
