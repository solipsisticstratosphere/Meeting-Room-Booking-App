import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Users, CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { roomsApi } from '../api/roomsApi';
import { bookingsApi } from '../api/bookingsApi';
import { useAppSelector } from '../store/hooks';
import { getErrorMessage } from '../utils/errorUtils';
import { formatDateTime, formatDateTimeLocal, convertLocalToUTC } from '../utils/dateUtils';
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
        startTime: convertLocalToUTC(data.startTime),
        endTime: convertLocalToUTC(data.endTime),
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
    editBookingForm.setValue('startTime', formatDateTimeLocal(booking.startTime));
    editBookingForm.setValue('endTime', formatDateTimeLocal(booking.endTime));
    editBookingForm.setValue('description', booking.description || '');
    setIsEditBookingModalOpen(true);
  };

  const handleEditBooking = async (data: UpdateBookingData) => {
    if (!editingBooking) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateBookingData = {
        ...data,
        startTime: data.startTime ? convertLocalToUTC(data.startTime) : undefined,
        endTime: data.endTime ? convertLocalToUTC(data.endTime) : undefined,
      };
      await bookingsApi.updateBooking(editingBooking.id, updateData);
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
        <div className="card border-l-4 border-l-primary-600">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{room.name}</h1>
              <p className="text-gray-600 text-lg mb-2">{room.description || 'No description'}</p>
              <p className="text-sm text-gray-500">Created by {room.createdBy.name}</p>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  <button onClick={() => setIsAddUserModalOpen(true)} className="btn-secondary">
                    + Add User
                  </button>
                  <button onClick={() => setIsBookingModalOpen(true)} className="btn-primary shadow-lg hover:shadow-xl">
                    + Create Booking
                  </button>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex gap-2">
                  <button onClick={handleEditRoomClick} className="btn-secondary">
                    Edit Room
                  </button>
                  <button onClick={handleDeleteRoom} className="btn-danger">
                    Delete Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Members</h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {room.roomUsers.length} {room.roomUsers.length === 1 ? 'member' : 'members'}
            </span>
          </div>
          {room.roomUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No members yet</p>
          ) : (
            <div className="space-y-3">
              {room.roomUsers.map((roomUser) => (
                <div
                  key={roomUser.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                      {roomUser.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{roomUser.user.name}</p>
                      <p className="text-sm text-gray-500">{roomUser.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAdmin && roomUser.userId !== room.createdById && roomUser.userId !== currentUser?.id ? (
                      <>
                        <select
                          value={roomUser.role}
                          onChange={(e) =>
                            handleChangeUserRole(roomUser.userId, e.target.value as RoomRole)
                          }
                          className="px-3 py-1.5 pr-10 rounded-lg text-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(roomUser.userId)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          roomUser.role === 'ADMIN'
                            ? 'bg-primary-100 text-primary-800 border border-primary-200'
                            : 'bg-gray-200 text-gray-800 border border-gray-300'
                        }`}
                      >
                        {roomUser.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Bookings</h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {room.bookings?.length || 0} {(room.bookings?.length || 0) === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
          {!room.bookings || room.bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Calendar className="w-12 h-12 text-primary-600" />
              </div>
              <p className="text-gray-500 text-lg">No bookings yet</p>
              {isAdmin && (
                <button 
                  onClick={() => setIsBookingModalOpen(true)} 
                  className="btn-primary mt-4"
                >
                  Create First Booking
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {room.bookings.map((booking: Booking) => {
                const ended = isBookingEnded(booking);
                return (
                  <div 
                    key={booking.id} 
                    className={`p-5 rounded-lg border transition-all ${
                      ended 
                        ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 opacity-75' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className={`font-semibold text-lg ${
                            ended ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {formatDateTime(booking.startTime)}
                          </p>
                          <span className={ended ? 'text-gray-400' : 'text-gray-400'}>→</span>
                          <p className={`font-semibold text-lg ${
                            ended ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {formatDateTime(booking.endTime)}
                          </p>
                          {ended && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium ml-2">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                        {booking.description && (
                          <p className={`mb-3 p-3 rounded-lg border ${
                            ended 
                              ? 'text-gray-500 bg-gray-100 border-gray-200' 
                              : 'text-gray-700 bg-white border-gray-100'
                          }`}>
                            {booking.description}
                          </p>
                        )}
                        <div className={`flex items-center gap-4 text-sm ${
                          ended ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          <span>Booked by <span className="font-medium">{booking.user.name}</span></span>
                          {booking.participants && booking.participants.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className={`w-4 h-4 ${
                                ended ? 'text-gray-500' : 'text-primary-600'
                              }`} />
                              {booking.participants.length} {booking.participants.length === 1 ? 'participant' : 'participants'}
                            </span>
                          )}
                        </div>

                        {booking.participants && booking.participants.length > 0 && (
                          <div className={`mt-4 pt-4 border-t ${
                            ended ? 'border-gray-300' : 'border-gray-200'
                          }`}>
                            <p className={`text-xs font-medium mb-2 ${
                              ended ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              Participants:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {booking.participants.map((participant) => (
                                <span
                                  key={participant.id}
                                  className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                                    ended 
                                      ? 'bg-gray-200 text-gray-600 border-gray-300' 
                                      : 'bg-primary-100 text-primary-800 border-primary-200'
                                  }`}
                                >
                                  {participant.user.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditBookingClick(booking)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                ended
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-primary-600 hover:text-primary-800 hover:bg-primary-50'
                              }`}
                              disabled={ended}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
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
                              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border border-gray-300"
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinBooking(booking.id)}
                              className="text-primary-700 hover:text-primary-900 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border border-primary-300"
                            >
                              Join
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              className="input resize-none"
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
              className="input resize-none"
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
              className="input resize-none"
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
