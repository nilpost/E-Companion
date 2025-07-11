# PetCare Community Platform

A modern, community-centric pet care web application that combines social networking, health tracking, appointment booking, and gamification features to create a comprehensive pet care ecosystem.

## 🌟 Features

### 🔐 Authentication & User Management
- Secure session-based authentication with Passport.js
- Role-based access control (Pet Owner, Trainer, Veterinarian, Groomer)
- User profiles with gamification elements (XP points, levels, badges)

### 🐾 Pet Management
- Unlimited pet profiles per user
- Comprehensive pet information (breed, age, weight, medical notes)
- Photo upload and avatar support
- Health tracking and medical records

### 🌐 Social Community
- Community feed with posts, images, and interactions
- Like and comment system
- Real-time social engagement
- User-generated content sharing

### 📅 Booking System
- Service provider discovery and booking
- Calendar integration for appointment scheduling
- Support for multiple service types (veterinary, grooming, training, walking)
- Provider profiles with detailed service information

### 🏥 Health Monitoring
- Activity tracking (steps, walks, exercise logs)
- Health record management (vet visits, medications, vaccinations)
- Real-time health dashboard with visual progress tracking
- Integration points for future IoT device connectivity

### 💬 Real-time Chat
- WebSocket-powered messaging system
- Pet care FAQ chat rooms
- Direct messaging between users
- Group chat functionality

### 🎯 Gamification
- XP point system for user engagement
- Achievement badges and milestones
- Level progression system
- Community leaderboards

### 🎨 User Experience
- Mobile-first responsive design
- Dark/light theme support
- Internationalization support (English/Japanese)
- Intuitive navigation with tab-based interface

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **shadcn/ui** components built on Radix UI
- **TanStack Query** for state management
- **Wouter** for lightweight routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express server
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication
- **WebSocket** for real-time features
- **Session-based authentication** with PostgreSQL storage

### Database
- **PostgreSQL** (Neon serverless)
- **Connection pooling** for scalability
- **Migration-based** schema management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petcare-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json           # Project configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## 🎮 How to Use

1. **Registration**: Create an account by selecting your role (Pet Owner, Trainer, Veterinarian, or Groomer)
2. **Pet Profiles**: Add your pets with detailed information and photos
3. **Community**: Share posts, interact with other pet owners, and engage with the community
4. **Health Tracking**: Monitor your pet's activities and health records
5. **Booking**: Find and book services from qualified providers
6. **Chat**: Join FAQ rooms or chat directly with service providers
7. **Gamification**: Earn XP points and badges through active participation

## 🌐 User Roles

- **Pet Owner**: Manage pets, book services, participate in community
- **Pet Trainer**: Offer training services, manage appointments, chat with clients
- **Veterinarian**: Provide medical services, manage health records
- **Pet Groomer**: Offer grooming services, schedule appointments

## 🔮 Future Enhancements

- 3D pet avatar integration
- IoT device connectivity for real-time health monitoring
- GPS tracking for walk routes and location services
- Push notification system
- Mobile app deployment via Expo
- Advanced gamification features
- Payment processing integration
- Provider rating and review system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Designed with accessibility and user experience in mind
- Community-driven development approach
- Special thanks to all contributors and testers

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for the pet care community**