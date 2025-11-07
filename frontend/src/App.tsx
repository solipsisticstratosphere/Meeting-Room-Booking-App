import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initAuth } from './store/authSlice';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loading } from './components/Loading';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Rooms } from './pages/Rooms';
import { RoomDetails } from './pages/RoomDetails';
import { MyRooms } from './pages/MyRooms';
import { MyBookings } from './pages/MyBookings';

function App() {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <RoomDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-rooms"
          element={
            <ProtectedRoute>
              <MyRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
