import { apiClient } from './client';
import type {
  MeetingRoom,
  CreateRoomData,
  UpdateRoomData,
  AddRoomUserData,
  RoomUser,
} from '../types';

export const roomsApi = {
  getAllRooms: async (): Promise<{ rooms: MeetingRoom[] }> => {
    const response = await apiClient.get<{ rooms: MeetingRoom[] }>('/rooms');
    return response.data;
  },

  getMyRooms: async (): Promise<{ rooms: RoomUser[] }> => {
    const response = await apiClient.get<{ rooms: RoomUser[] }>('/rooms/my');
    return response.data;
  },

  getRoomById: async (id: string): Promise<{ room: MeetingRoom }> => {
    const response = await apiClient.get<{ room: MeetingRoom }>(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data: CreateRoomData): Promise<{ message: string; room: MeetingRoom }> => {
    const response = await apiClient.post<{ message: string; room: MeetingRoom }>('/rooms', data);
    return response.data;
  },

  updateRoom: async (
    id: string,
    data: UpdateRoomData
  ): Promise<{ message: string; room: MeetingRoom }> => {
    const response = await apiClient.put<{ message: string; room: MeetingRoom }>(
      `/rooms/${id}`,
      data
    );
    return response.data;
  },

  deleteRoom: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/rooms/${id}`);
    return response.data;
  },

  addUserToRoom: async (
    roomId: string,
    data: AddRoomUserData
  ): Promise<{ message: string; roomUser: RoomUser }> => {
    const response = await apiClient.post<{ message: string; roomUser: RoomUser }>(
      `/rooms/${roomId}/users`,
      data
    );
    return response.data;
  },

  removeUserFromRoom: async (roomId: string, userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/rooms/${roomId}/users/${userId}`
    );
    return response.data;
  },

  updateUserRole: async (
    roomId: string,
    userId: string,
    role: 'ADMIN' | 'USER'
  ): Promise<{ message: string; roomUser: RoomUser }> => {
    const response = await apiClient.patch<{ message: string; roomUser: RoomUser }>(
      `/rooms/${roomId}/users/${userId}`,
      { role }
    );
    return response.data;
  },
};
