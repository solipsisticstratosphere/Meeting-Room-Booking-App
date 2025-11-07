import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { roomsApi } from '../api/roomsApi';
import { getErrorMessage } from '../utils/errorUtils';
import type { RoomUser } from '../types';

export const MyRooms = () => {
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        const data = await roomsApi.getMyRooms();
        setRoomUsers(data.rooms);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRooms();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">My Rooms</h1>

        {roomUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You are not a member of any rooms yet.</p>
            <button onClick={() => navigate('/rooms')} className="btn-primary mt-4">
              Browse All Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomUsers.map((roomUser) => (
              <div
                key={roomUser.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/rooms/${roomUser.meetingRoomId}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {roomUser.meetingRoom?.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roomUser.role === 'ADMIN'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {roomUser.role}
                  </span>
                </div>
                <p className="text-gray-600 line-clamp-2">
                  {roomUser.meetingRoom?.description || 'No description'}
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  Created by {roomUser.meetingRoom?.createdBy.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
