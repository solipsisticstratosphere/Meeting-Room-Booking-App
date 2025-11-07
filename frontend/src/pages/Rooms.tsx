import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { roomsApi } from '../api/roomsApi';
import { getErrorMessage } from '../utils/errorUtils';
import type { MeetingRoom, CreateRoomData } from '../types';

export const Rooms = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoomData>();

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getAllRooms();
      setRooms(data.rooms);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onSubmit = async (data: CreateRoomData) => {
    setIsSubmitting(true);
    try {
      await roomsApi.createRoom(data);
      toast.success('Room created successfully!');
      setIsModalOpen(false);
      reset();
      fetchRooms();
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">All Meeting Rooms</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create New Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No rooms available. Create your first room!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {room.description || 'No description'}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{room._count?.bookings || 0} bookings</span>
                  <span>{room.roomUsers.length} members</span>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Created by {room.createdBy.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Room">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Room Name</label>
            <input
              {...register('name', {
                required: 'Room name is required',
                minLength: {
                  value: 3,
                  message: 'Room name must be at least 3 characters',
                },
              })}
              type="text"
              className="input"
              placeholder="Enter room name"
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              className="input"
              rows={3}
              placeholder="Enter room description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
