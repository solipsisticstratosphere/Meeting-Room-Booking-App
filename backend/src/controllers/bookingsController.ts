import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';
import { bookingInclude } from '../utils/prismaIncludes';
import { cleanupEndedBookings } from '../utils/bookingCleanup';

const checkTimeConflict = async (
  meetingRoomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
) => {
  const conflicts = await prisma.booking.findMany({
    where: {
      meetingRoomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        //booking starts during existing booking
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        //booking ends during existing booking
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        },
        //booking covers existing booking
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ]
    }
  });

  return conflicts.length > 0;
};

// Get all bookings for a room
export const getRoomBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    await cleanupEndedBookings();

    const bookings = await prisma.booking.findMany({
      where: { meetingRoomId: roomId },
      include: bookingInclude,
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get room bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users bookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await cleanupEndedBookings();

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get booking by id
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await cleanupEndedBookings();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: bookingInclude
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create booking
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { meetingRoomId, startTime, endTime, description } = req.body;

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId,
          userId
        }
      }
    });

    if (!roomUser) {
      return res.status(403).json({ message: 'You do not have access to this room' });
    }

    if (roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can create bookings' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot create booking in the past' });
    }

    const hasConflict = await checkTimeConflict(meetingRoomId, start, end);

    if (hasConflict) {
      return res.status(409).json({ message: 'Time slot is already booked' });
    }

    const booking = await prisma.booking.create({
      data: {
        meetingRoomId,
        userId,
        startTime: start,
        endTime: end,
        description
      },
      include: bookingInclude
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update booking
export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { startTime, endTime, description } = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        meetingRoom: true,
        participants: true
      }
    });

    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: existingBooking.meetingRoomId,
          userId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update bookings' });
    }

    const updateData: any = {};

    if (startTime || endTime) {
      if (existingBooking.participants && existingBooking.participants.length > 0) {
        return res.status(400).json({
          message: 'Cannot change booking time when there are participants. Please remove all participants first.'
        });
      }

      const start = startTime ? new Date(startTime) : existingBooking.startTime;
      const end = endTime ? new Date(endTime) : existingBooking.endTime;

      if (start >= end) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }

      const hasConflict = await checkTimeConflict(
        existingBooking.meetingRoomId,
        start,
        end,
        id
      );

      if (hasConflict) {
        return res.status(409).json({ message: 'Time slot is already booked' });
      }

      updateData.startTime = start;
      updateData.endTime = end;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: bookingInclude
    });

    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete booking
export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: existingBooking.meetingRoomId,
          userId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete bookings' });
    }

    await prisma.booking.delete({
      where: { id }
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Join booking as participant
export const joinBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await cleanupEndedBookings();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        meetingRoom: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: booking.meetingRoomId,
          userId
        }
      }
    });

    if (!roomUser) {
      return res.status(403).json({ message: 'You do not have access to this room' });
    }

    const existingParticipant = await prisma.bookingParticipant.findUnique({
      where: {
        bookingId_userId: {
          bookingId: id,
          userId
        }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'You are already a participant of this booking' });
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now < startTime) {
      return res.status(400).json({ message: 'Cannot join a booking that has not started yet' });
    }

    if (now >= endTime) {
      return res.status(400).json({ message: 'Cannot join a booking that has already ended' });
    }

    // Add participant
    const participant = await prisma.bookingParticipant.create({
      data: {
        bookingId: id,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Joined booking successfully',
      participant
    });
  } catch (error) {
    console.error('Join booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Leave booking as participant
export const leaveBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const participant = await prisma.bookingParticipant.findUnique({
      where: {
        bookingId_userId: {
          bookingId: id,
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'You are not a participant of this booking' });
    }

    // Remove participant
    await prisma.bookingParticipant.delete({
      where: {
        bookingId_userId: {
          bookingId: id,
          userId
        }
      }
    });

    res.json({ message: 'Left booking successfully' });
  } catch (error) {
    console.error('Leave booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
