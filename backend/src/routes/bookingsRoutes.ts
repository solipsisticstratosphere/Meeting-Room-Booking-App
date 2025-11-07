import { Router } from 'express';
import {
  getRoomBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  joinBooking,
  leaveBooking
} from '../controllers/bookingsController';
import {
  createBookingValidation,
  updateBookingValidation
} from '../middleware/validationMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/bookings/my - Get users bookings
router.get('/my', getMyBookings);

// GET /api/bookings/room/:roomId - Get room bookings
router.get('/room/:roomId', getRoomBookings);

// GET /api/bookings/:id - Get booking by id
router.get('/:id', getBookingById);

// POST /api/bookings - Create booking
router.post('/', createBookingValidation, createBooking);

// PUT /api/bookings/:id - Update booking
router.put('/:id', updateBookingValidation, updateBooking);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', deleteBooking);

// POST /api/bookings/:id/join - Join booking as participant
router.post('/:id/join', joinBooking);

// DELETE /api/bookings/:id/leave - Leave booking as participant
router.delete('/:id/leave', leaveBooking);

export default router;
