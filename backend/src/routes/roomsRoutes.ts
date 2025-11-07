import { Router } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  addUserToRoom,
  removeUserFromRoom,
  getMyRooms,
  updateUserRole
} from '../controllers/roomsController';
import {
  createRoomValidation,
  updateRoomValidation,
  addRoomUserValidation,
  updateUserRoleValidation
} from '../middleware/validationMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();


router.use(authenticateToken);

// GET /api/rooms - Get all rooms
router.get('/', getAllRooms);

// GET /api/rooms/my - Get users rooms
router.get('/my', getMyRooms);

// GET /api/rooms/:id - Get room by id
router.get('/:id', getRoomById);

// POST /api/rooms - Create room
router.post('/', createRoomValidation, createRoom);

// PUT /api/rooms/:id - Update room
router.put('/:id', updateRoomValidation, updateRoom);

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', deleteRoom);

// Post /api/rooms/:id/users - Add user to room
router.post('/:id/users', addRoomUserValidation, addUserToRoom);

// PATCH /api/rooms/:id/users/:userId - Update user role in room
router.patch('/:id/users/:userId', updateUserRoleValidation, updateUserRole);

// DELETE /api/rooms/:id/users/:userId - Remove user from room
router.delete('/:id/users/:userId', removeUserFromRoom);

export default router;
