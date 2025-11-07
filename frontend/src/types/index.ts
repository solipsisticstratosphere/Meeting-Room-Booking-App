export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  roomUsers: RoomUser[];
  bookings?: Booking[];
  _count?: {
    bookings: number;
  };
}

export interface RoomUser {
  id: string;
  meetingRoomId: string;
  userId: string;
  role: RoomRole;
  createdAt: string;
  user: User;
  meetingRoom?: MeetingRoom;
}

export enum RoomRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface BookingParticipant {
  id: string;
  bookingId: string;
  userId: string;
  createdAt: string;
  user: User;
}

export interface Booking {
  id: string;
  meetingRoomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  meetingRoom: {
    id: string;
    name: string;
    description?: string;
  };
  participants?: BookingParticipant[];
}

export interface CreateRoomData {
  name: string;
  description?: string;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
}

export interface CreateBookingData {
  meetingRoomId: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface UpdateBookingData {
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface AddRoomUserData {
  userEmail: string;
  role: RoomRole;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}
