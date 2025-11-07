import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { bookingsApi } from '../api/bookingsApi';
import { getErrorMessage } from '../utils/errorUtils';
import { formatDateTime } from '../utils/dateUtils';
import type { Booking } from '../types';

export const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(data.bookings);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await bookingsApi.deleteBooking(id);
      toast.success('Booking deleted successfully!');
      fetchBookings();
    } catch (error) {
      toast.error(getErrorMessage(error));
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
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You don't have any bookings yet.</p>
            <button onClick={() => navigate('/rooms')} className="btn-primary mt-4">
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 cursor-pointer"
                      onClick={() => navigate(`/rooms/${booking.meetingRoomId}`)}
                    >
                      {booking.meetingRoom.name}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-700">
                        <span className="font-medium">Start:</span>{' '}
                        {formatDateTime(booking.startTime)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">End:</span> {formatDateTime(booking.endTime)}
                      </p>
                      {booking.description && (
                        <p className="text-gray-600 mt-2">{booking.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="btn-danger ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
