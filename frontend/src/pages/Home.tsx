import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAppSelector } from '../store/hooks';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto text-center py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to Meeting Room Booking
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Easily manage and book meeting rooms for your team. Create rooms, schedule bookings, and
            collaborate with your colleagues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="card text-center hover:shadow-xl transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Building2 className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Create Rooms</h3>
            <p className="text-gray-600 leading-relaxed">Set up meeting rooms with custom names and descriptions</p>
          </div>

          <div className="card text-center hover:shadow-xl transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Calendar className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Schedule Bookings</h3>
            <p className="text-gray-600 leading-relaxed">Book rooms for specific times and manage your schedule</p>
          </div>

          <div className="card text-center hover:shadow-xl transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Collaborate</h3>
            <p className="text-gray-600 leading-relaxed">Add team members with different roles and permissions</p>
          </div>
        </div>

        {isAuthenticated ? (
          <button 
            onClick={() => navigate('/rooms')} 
            className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            Browse Rooms
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')} 
              className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="btn-secondary text-lg px-8 py-3 shadow-md hover:shadow-lg transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
