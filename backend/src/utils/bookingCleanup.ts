import prisma from './prisma';

export const cleanupEndedBookings = async (): Promise<number> => {
  try {
    const now = new Date();

    const endedBookings = await prisma.booking.findMany({
      where: {
        endTime: {
          lt: now
        },
        participants: {
          some: {} 
        }
      },
      select: {
        id: true
      }
    });

    if (endedBookings.length === 0) {
      return 0;
    }

    const bookingIds = endedBookings.map(booking => booking.id);

    const result = await prisma.bookingParticipant.deleteMany({
      where: {
        bookingId: {
          in: bookingIds
        }
      }
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up ended bookings:', error);
    return 0;
  }
};

