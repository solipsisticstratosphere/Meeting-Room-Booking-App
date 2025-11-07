# Meeting Room Booking App - Full Stack Application

A full-stack meeting room booking application with user authentication, room management, and booking system, built with React and Express.js.

## Features

- **User Authentication**: Register, login, logout functionality with JWT tokens
- **Room Management**: Create, edit, delete meeting rooms with descriptions
- **Room Access Control**: Add users to rooms with ADMIN or USER roles
- **Booking System**: Create, edit, delete room bookings with time slots
- **Booking Participants**: Join and leave active bookings
- **My Bookings**: View and manage your personal bookings
- **My Rooms**: View rooms where you are a member
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Real-time Updates**: Automatic UI updates after actions
- **Secure API**: Protected routes and input validation

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **date-fns** - Date formatting utilities

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **PostgreSQL** - Database
- **Express Validator** - Input validation

## Project Structure

```
Meeting-Room-Booking-App/
├── backend/                 # Express.js backend
│   ├── prisma/             # Prisma schema and migrations
│   │   ├── migrations/     # Database migrations
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── bookingsController.ts
│   │   │   └── roomsController.ts
│   │   ├── middleware/     # Authentication & validation middleware
│   │   │   ├── authMiddleware.ts
│   │   │   └── validationMiddleware.ts
│   │   ├── routes/         # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── bookingsRoutes.ts
│   │   │   └── roomsRoutes.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── bookingCleanup.ts
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── prisma.ts
│   │   │   └── prismaIncludes.ts
│   │   └── server.ts       # Main server file
│   └── package.json
├── frontend/                # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API client functions
│   │   │   ├── authApi.ts
│   │   │   ├── bookingsApi.ts
│   │   │   ├── client.ts
│   │   │   └── roomsApi.ts
│   │   ├── components/     # React components
│   │   │   ├── Layout.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Rooms.tsx
│   │   │   ├── MyRooms.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   └── RoomDetails.tsx
│   │   ├── store/          # Redux store and slices
│   │   │   ├── authSlice.ts
│   │   │   ├── hooks.ts
│   │   │   └── index.ts
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── bookingUtils.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── errorUtils.ts
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://username:password@localhost:5432/meeting_room_booking?schema=public
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

This will create all necessary tables (users, meeting_rooms, bookings, room_users, booking_participants).

6. (Optional) Open Prisma Studio to view your database:
```bash
npm run prisma:studio
```

7. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

### Running the Application

1. Make sure PostgreSQL is running
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser (or the port shown in terminal)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
  - Body: `{ name, email, password }`
- `POST /api/auth/login` - User login
  - Body: `{ email, password }`
- `GET /api/auth/me` - Get current user info (protected)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/my` - Get rooms where current user is a member (protected)
- `GET /api/rooms/:id` - Get room by ID with bookings and members (protected)
- `POST /api/rooms` - Create new room (protected)
  - Body: `{ name, description? }`
- `PUT /api/rooms/:id` - Update room (protected, admin only)
  - Body: `{ name, description? }`
- `DELETE /api/rooms/:id` - Delete room (protected, admin only)
- `POST /api/rooms/:id/users` - Add user to room (protected, admin only)
  - Body: `{ userEmail, role }`
- `DELETE /api/rooms/:id/users/:userId` - Remove user from room (protected, admin only)
- `PUT /api/rooms/:id/users/:userId/role` - Update user role in room (protected, admin only)
  - Body: `{ role }`

### Bookings
- `GET /api/bookings/my` - Get current user's bookings (protected)
- `GET /api/bookings/room/:roomId` - Get bookings for a specific room (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `POST /api/bookings` - Create new booking (protected)
  - Body: `{ meetingRoomId, startTime, endTime, description? }`
- `PUT /api/bookings/:id` - Update booking (protected, admin only)
  - Body: `{ startTime, endTime, description? }`
- `DELETE /api/bookings/:id` - Delete booking (protected, admin only)
- `POST /api/bookings/:id/join` - Join a booking as participant (protected)
- `DELETE /api/bookings/:id/leave` - Leave a booking (protected)

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### Models
- **User**: User accounts with authentication
- **MeetingRoom**: Meeting rooms with creator and description
- **Booking**: Room bookings with time slots
- **RoomUser**: Many-to-many relationship between users and rooms with roles (ADMIN/USER)
- **BookingParticipant**: Many-to-many relationship between users and bookings

### Key Features
- Cascade deletes for data integrity
- Unique constraints on relationships
- Role-based access control (ADMIN/USER)
- Timestamps on all models

## Features in Detail

### Room Management
- Create rooms with name and optional description
- Add users to rooms with ADMIN or USER role
- Admins can edit room details, add/remove users, and change user roles
- View all rooms or filter by your membership

### Booking System
- Create bookings with start and end times
- Join active bookings as a participant
- View booking history and upcoming bookings
- Admins can edit or delete any booking in their rooms
- Visual indicators for completed bookings

### User Roles
- **ADMIN**: Full control over room and bookings
- **USER**: Can create bookings and join active ones

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- Input validation on both frontend and backend
- CORS configuration for secure cross-origin requests


