export const userSelect = {
  id: true,
  name: true,
  email: true,
};

export const bookingInclude = {
  user: {
    select: userSelect,
  },
  meetingRoom: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  participants: {
    include: {
      user: {
        select: userSelect,
      },
    },
  },
};

export const roomIncludeBasic = {
  createdBy: {
    select: userSelect,
  },
  roomUsers: {
    include: {
      user: {
        select: userSelect,
      },
    },
  },
  _count: {
    select: {
      bookings: true,
    },
  },
};

export const roomIncludeFull = {
  createdBy: {
    select: userSelect,
  },
  roomUsers: {
    include: {
      user: {
        select: userSelect,
      },
    },
  },
  bookings: {
    include: bookingInclude,
  },
  _count: {
    select: {
      bookings: true,
    },
  },
};
