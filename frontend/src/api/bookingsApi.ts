import { apiClient } from './client';
import type { Booking, CreateBookingData, UpdateBookingData, BookingParticipant } from '../types';

export const bookingsApi = {
  getMyBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await apiClient.get<{ bookings: Booking[] }>('/bookings/my');
    return response.data;
  },

  getRoomBookings: async (roomId: string): Promise<{ bookings: Booking[] }> => {
    const response = await apiClient.get<{ bookings: Booking[] }>(`/bookings/room/${roomId}`);
    return response.data;
  },

  getBookingById: async (id: string): Promise<{ booking: Booking }> => {
    const response = await apiClient.get<{ booking: Booking }>(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (
    data: CreateBookingData
  ): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.post<{ message: string; booking: Booking }>(
      '/bookings',
      data
    );
    return response.data;
  },

  updateBooking: async (
    id: string,
    data: UpdateBookingData
  ): Promise<{ message: string; booking: Booking }> => {
    const response = await apiClient.put<{ message: string; booking: Booking }>(
      `/bookings/${id}`,
      data
    );
    return response.data;
  },

  deleteBooking: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/bookings/${id}`);
    return response.data;
  },

  joinBooking: async (id: string): Promise<{ message: string; participant: BookingParticipant }> => {
    const response = await apiClient.post<{ message: string; participant: BookingParticipant }>(
      `/bookings/${id}/join`
    );
    return response.data;
  },

  leaveBooking: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/bookings/${id}/leave`);
    return response.data;
  },
};
