import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Calendar, Users } from 'lucide-react';
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
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Meeting Rooms</h1>
            <p className="text-gray-600">Browse and manage all available meeting rooms</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            + Create New Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="card text-center py-16">
            <div className="flex justify-center mb-4">
              <Building2 className="w-16 h-16 text-primary-600" />
            </div>
            <p className="text-gray-600 text-lg mb-4">No rooms available yet</p>
            <p className="text-gray-500 mb-6">Create your first room to get started!</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-200"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{room.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
                  {room.description || 'No description'}
                </p>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      {room._count?.bookings || 0} bookings
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary-600" />
                      {room.roomUsers.length} members
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
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
              className="input resize-none"
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
