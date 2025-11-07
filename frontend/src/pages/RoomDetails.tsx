import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { roomsApi } from '../api/roomsApi';
import { bookingsApi } from '../api/bookingsApi';
import { useAppSelector } from '../store/hooks';
import { getErrorMessage } from '../utils/errorUtils';
import { formatDateTime } from '../utils/dateUtils';
import { isBookingActive, isBookingEnded } from '../utils/bookingUtils';
import type {
  MeetingRoom,
  AddRoomUserData,
  CreateBookingData,
  UpdateBookingData,
  UpdateRoomData,
  RoomRole,
  Booking,
} from '../types';

export const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [room, setRoom] = useState<MeetingRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addUserForm = useForm<AddRoomUserData>();
  const bookingForm = useForm<CreateBookingData>();
  const editRoomForm = useForm<UpdateRoomData>();
  const editBookingForm = useForm<UpdateBookingData>();

  const userRole = room?.roomUsers.find((ru) => ru.userId === currentUser?.id)?.role;
  const isAdmin = userRole === 'ADMIN';

  const fetchRoom = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await roomsApi.getRoomById(id);
      setRoom(data.room);
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const handleAddUser = async (data: AddRoomUserData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await roomsApi.addUserToRoom(id, data);
      toast.success('User added successfully!');
      setIsAddUserModalOpen(false);
      addUserForm.reset();
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async (data: CreateBookingData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await bookingsApi.createBooking({
        ...data,
        meetingRoomId: id,
      });
      toast.success('Booking created successfully!');
      setIsBookingModalOpen(false);
      bookingForm.reset();
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await roomsApi.deleteRoom(id);
      toast.success('Room deleted successfully!');
      navigate('/rooms');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!id || !window.confirm('Are you sure you want to remove this user?')) return;

    try {
      await roomsApi.removeUserFromRoom(id, userId);
      toast.success('User removed successfully!');
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: RoomRole) => {
    if (!id) return;

    try {
      await roomsApi.updateUserRole(id, userId, newRole);
      toast.success('User role updated successfully!');
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await bookingsApi.deleteBooking(bookingId);
      toast.success('Booking deleted successfully!');
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleJoinBooking = async (bookingId: string) => {
    try {
      await bookingsApi.joinBooking(bookingId);
      toast.success('Joined booking successfully!');
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLeaveBooking = async (bookingId: string) => {
    try {
      await bookingsApi.leaveBooking(bookingId);
      toast.success('Left booking successfully!');
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEditRoomClick = () => {
    if (!room) return;
    editRoomForm.setValue('name', room.name);
    editRoomForm.setValue('description', room.description || '');
    setIsEditRoomModalOpen(true);
  };

  const handleEditRoom = async (data: UpdateRoomData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await roomsApi.updateRoom(id, data);
      toast.success('Room updated successfully!');
      setIsEditRoomModalOpen(false);
      editRoomForm.reset();
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBookingClick = (booking: Booking) => {
    setEditingBooking(booking);
    editBookingForm.setValue('startTime', booking.startTime.slice(0, 16));
    editBookingForm.setValue('endTime', booking.endTime.slice(0, 16));
    editBookingForm.setValue('description', booking.description || '');
    setIsEditBookingModalOpen(true);
  };

  const handleEditBooking = async (data: UpdateBookingData) => {
    if (!editingBooking) return;

    setIsSubmitting(true);
    try {
      await bookingsApi.updateBooking(editingBooking.id, data);
      toast.success('Booking updated successfully!');
      setIsEditBookingModalOpen(false);
      setEditingBooking(null);
      editBookingForm.reset();
      fetchRoom();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Room not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
            <p className="text-gray-600 mt-2">{room.description || 'No description'}</p>
            <p className="text-sm text-gray-400 mt-1">Created by {room.createdBy.name}</p>
          </div>
          <div className="flex space-x-2">
            {isAdmin && (
              <>
                <button onClick={handleEditRoomClick} className="btn-secondary">
                  Edit Room
                </button>
                <button onClick={() => setIsAddUserModalOpen(true)} className="btn-secondary">
                  Add User
                </button>
                <button onClick={() => setIsBookingModalOpen(true)} className="btn-primary">
                  Create Booking
                </button>
                <button onClick={handleDeleteRoom} className="btn-danger">
                  Delete Room
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Members ({room.roomUsers.length})</h2>
          <div className="space-y-2">
            {room.roomUsers.map((roomUser) => (
              <div
                key={roomUser.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{roomUser.user.name}</p>
                  <p className="text-sm text-gray-500">{roomUser.user.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isAdmin && roomUser.userId !== room.createdById && roomUser.userId !== currentUser?.id ? (
                    <select
                      value={roomUser.role}
                      onChange={(e) =>
                        handleChangeUserRole(roomUser.userId, e.target.value as RoomRole)
                      }
                      className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        roomUser.role === 'ADMIN'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {roomUser.role}
                    </span>
                  )}
                  {isAdmin && roomUser.userId !== room.createdById && roomUser.userId !== currentUser?.id && (
                    <button
                      onClick={() => handleRemoveUser(roomUser.userId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Bookings ({room.bookings?.length || 0})
          </h2>
          {!room.bookings || room.bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {room.bookings.map((booking: Booking) => (
                <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Booked by {booking.user.name}</p>

                      {booking.participants && booking.participants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Participants ({booking.participants.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {booking.participants.map((participant) => (
                              <span
                                key={participant.id}
                                className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded"
                              >
                                {participant.user.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEditBookingClick(booking)}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {/* Join/Leave booking buttons - only for active bookings */}
                      {isBookingActive(booking) && (
                        booking.participants?.some(p => p.userId === currentUser?.id) ? (
                          <button
                            onClick={() => handleLeaveBooking(booking.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinBooking(booking.id)}
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            Join
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add User to Room"
      >
        <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
          <div>
            <label className="label">User Email</label>
            <input
              {...addUserForm.register('userEmail', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className="input"
              placeholder="user@example.com"
            />
            {addUserForm.formState.errors.userEmail && (
              <p className="error-message">{addUserForm.formState.errors.userEmail.message}</p>
            )}
          </div>

          <div>
            <label className="label">Role</label>
            <select {...addUserForm.register('role', { required: true })} className="input">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Create Booking"
      >
        <form onSubmit={bookingForm.handleSubmit(handleCreateBooking)} className="space-y-4">
          <div>
            <label className="label">Start Time</label>
            <input
              {...bookingForm.register('startTime', { required: 'Start time is required' })}
              type="datetime-local"
              className="input"
            />
            {bookingForm.formState.errors.startTime && (
              <p className="error-message">{bookingForm.formState.errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="label">End Time</label>
            <input
              {...bookingForm.register('endTime', { required: 'End time is required' })}
              type="datetime-local"
              className="input"
            />
            {bookingForm.formState.errors.endTime && (
              <p className="error-message">{bookingForm.formState.errors.endTime.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...bookingForm.register('description')}
              className="input"
              rows={3}
              placeholder="Enter booking description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditRoomModalOpen}
        onClose={() => setIsEditRoomModalOpen(false)}
        title="Edit Room"
      >
        <form onSubmit={editRoomForm.handleSubmit(handleEditRoom)} className="space-y-4">
          <div>
            <label className="label">Room Name</label>
            <input
              {...editRoomForm.register('name', { required: 'Room name is required' })}
              type="text"
              className="input"
              placeholder="Enter room name"
            />
            {editRoomForm.formState.errors.name && (
              <p className="error-message">{editRoomForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...editRoomForm.register('description')}
              className="input"
              rows={3}
              placeholder="Enter room description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditRoomModalOpen(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Room'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditBookingModalOpen}
        onClose={() => setIsEditBookingModalOpen(false)}
        title="Edit Booking"
      >
        <form onSubmit={editBookingForm.handleSubmit(handleEditBooking)} className="space-y-4">
          {editingBooking && isBookingEnded(editingBooking) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> Cannot edit a booking that has already ended.
              </p>
            </div>
          )}

          {editingBooking && isBookingActive(editingBooking) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This booking is currently active. Changing the time may affect participants.
              </p>
            </div>
          )}

          {editingBooking && editingBooking.participants && editingBooking.participants.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Cannot change booking time because there are {editingBooking.participants.length} participant(s).
                Remove all participants first to change the time.
              </p>
            </div>
          )}

          <div>
            <label className="label">Start Time</label>
            <input
              {...editBookingForm.register('startTime', { required: 'Start time is required' })}
              type="datetime-local"
              className="input"
              disabled={
                !!(editingBooking?.participants && editingBooking.participants.length > 0) ||
                !!(editingBooking && isBookingEnded(editingBooking))
              }
            />
            {editBookingForm.formState.errors.startTime && (
              <p className="error-message">{editBookingForm.formState.errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="label">End Time</label>
            <input
              {...editBookingForm.register('endTime', { required: 'End time is required' })}
              type="datetime-local"
              className="input"
              disabled={
                !!(editingBooking?.participants && editingBooking.participants.length > 0) ||
                !!(editingBooking && isBookingEnded(editingBooking))
              }
            />
            {editBookingForm.formState.errors.endTime && (
              <p className="error-message">{editBookingForm.formState.errors.endTime.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...editBookingForm.register('description')}
              className="input"
              rows={3}
              placeholder="Enter booking description (optional)"
              disabled={!!(editingBooking && isBookingEnded(editingBooking))}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditBookingModalOpen(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !!(editingBooking && isBookingEnded(editingBooking))}
            >
              {isSubmitting ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
