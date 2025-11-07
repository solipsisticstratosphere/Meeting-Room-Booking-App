import type { Booking } from '../types';

export const isBookingActive = (booking: Booking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  return now >= startTime && now < endTime;
};

export const isBookingUpcoming = (booking: Booking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  return now < startTime;
};

export const isBookingEnded = (booking: Booking): boolean => {
  const now = new Date();
  const endTime = new Date(booking.endTime);
  return now >= endTime;
};
