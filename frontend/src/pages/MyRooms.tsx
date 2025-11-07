import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DoorOpen } from 'lucide-react';
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Rooms</h1>
          <p className="text-gray-600">Rooms where you are a member</p>
        </div>

        {roomUsers.length === 0 ? (
          <div className="card text-center py-16">
            <div className="flex justify-center mb-4">
              <DoorOpen className="w-16 h-16 text-primary-600" />
            </div>
            <p className="text-gray-600 text-lg mb-4">You are not a member of any rooms yet</p>
            <p className="text-gray-500 mb-6">Browse all rooms to join or create your own!</p>
            <button onClick={() => navigate('/rooms')} className="btn-primary">
              Browse All Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomUsers.map((roomUser) => (
              <div
                key={roomUser.id}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-200"
                onClick={() => navigate(`/rooms/${roomUser.meetingRoomId}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-2">
                    {roomUser.meetingRoom?.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      roomUser.role === 'ADMIN'
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {roomUser.role}
                  </span>
                </div>
                <p className="text-gray-600 line-clamp-2 min-h-[3rem] mb-4">
                  {roomUser.meetingRoom?.description || 'No description'}
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Created by {roomUser.meetingRoom?.createdBy.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
