import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { bookingsApi } from '../api/bookingsApi';
import { getErrorMessage } from '../utils/errorUtils';
import { formatDateTime } from '../utils/dateUtils';
import { isBookingEnded } from '../utils/bookingUtils';
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your scheduled room bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="flex justify-center mb-4">
              <Calendar className="w-16 h-16 text-primary-600" />
            </div>
            <p className="text-gray-600 text-lg mb-4">You don't have any bookings yet</p>
            <p className="text-gray-500 mb-6">Start booking rooms to manage your schedule!</p>
            <button onClick={() => navigate('/rooms')} className="btn-primary">
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const ended = isBookingEnded(booking);
              return (
                <div 
                  key={booking.id} 
                  className={`card hover:shadow-lg transition-all duration-300 border ${
                    ended 
                      ? 'bg-gray-50 border-gray-300 opacity-75' 
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <h3
                          className={`text-xl font-semibold cursor-pointer transition-colors ${
                            ended 
                              ? 'text-gray-500 hover:text-gray-700' 
                              : 'text-gray-900 hover:text-primary-600'
                          }`}
                          onClick={() => navigate(`/rooms/${booking.meetingRoomId}`)}
                        >
                          {booking.meetingRoom.name}
                        </h3>
                        {ended && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 ${
                          ended ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          <span className={`font-medium ${
                            ended ? 'text-gray-500' : 'text-primary-600'
                          }`}>Start:</span>
                          <span>{formatDateTime(booking.startTime)}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          ended ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          <span className={`font-medium ${
                            ended ? 'text-gray-500' : 'text-primary-600'
                          }`}>End:</span>
                          <span>{formatDateTime(booking.endTime)}</span>
                        </div>
                        {booking.description && (
                          <p className={`mt-3 p-3 rounded-lg border ${
                            ended 
                              ? 'text-gray-500 bg-gray-100 border-gray-200' 
                              : 'text-gray-600 bg-gray-50 border-gray-100'
                          }`}>
                            {booking.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="btn-danger whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
