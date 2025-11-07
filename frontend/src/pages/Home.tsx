import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../store/hooks';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Meeting Room Booking
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Easily manage and book meeting rooms for your team. Create rooms, schedule bookings, and
          collaborate with your colleagues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Create Rooms</h3>
            <p className="text-gray-600">Set up meeting rooms with custom names and descriptions</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Schedule Bookings</h3>
            <p className="text-gray-600">Book rooms for specific times and manage your schedule</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-gray-600">Add team members with different roles and permissions</p>
          </div>
        </div>

        {isAuthenticated ? (
          <button onClick={() => navigate('/rooms')} className="btn-primary text-lg px-8 py-3">
            Browse Rooms
          </button>
        ) : (
          <div className="space-x-4">
            <button onClick={() => navigate('/register')} className="btn-primary text-lg px-8 py-3">
              Get Started
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary text-lg px-8 py-3">
              Sign In
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
