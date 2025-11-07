import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

// Get all rooms
export const getAllRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await prisma.meetingRoom.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        roomUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ rooms });
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single room
export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.meetingRoom.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        roomUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ message: 'Meeting room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create room
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description } = req.body;

    const room = await prisma.meetingRoom.create({
      data: {
        name,
        description,
        createdById: userId,
        roomUsers: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        roomUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Meeting room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update room
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, description } = req.body;

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update room details' });
    }

    const room = await prisma.meetingRoom.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        roomUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Meeting room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete oom
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete rooms' });
    }

    await prisma.meetingRoom.delete({
      where: { id }
    });

    res.json({ message: 'Meeting room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// add user to room
export const addUserToRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { userEmail, role } = req.body;

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can add users to room' });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const existingRoomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId: userToAdd.id
        }
      }
    });

    if (existingRoomUser) {
      return res.status(400).json({ message: 'User is already in this room' });
    }

    const newRoomUser = await prisma.roomUser.create({
      data: {
        meetingRoomId: id,
        userId: userToAdd.id,
        role
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
      message: 'User added to room successfully',
      roomUser: newRoomUser
    });
  } catch (error) {
    console.error('Add user to room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove user from room
export const removeUserFromRoom = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { id, userId } = req.params;

    const roomUser = await prisma.roomUser.findUnique({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId: currentUserId
        }
      }
    });

    if (!roomUser || roomUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can remove users from room' });
    }

    const room = await prisma.meetingRoom.findUnique({
      where: { id }
    });

    if (room?.createdById === userId) {
      return res.status(400).json({ message: 'Cannot remove room creator' });
    }

    await prisma.roomUser.delete({
      where: {
        meetingRoomId_userId: {
          meetingRoomId: id,
          userId
        }
      }
    });

    res.json({ message: 'User removed from room successfully' });
  } catch (error) {
    console.error('Remove user from room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get users rooms
export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const roomUsers = await prisma.roomUser.findMany({
      where: { userId },
      include: {
        meetingRoom: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                bookings: true,
                roomUsers: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ rooms: roomUsers });
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
