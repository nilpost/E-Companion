# Pet Care Community App

## Overview

This is a community-centric, gamified pet care mobile application built as a React web app optimized for mobile devices. The app combines social networking, health tracking, appointment booking, and gamification features to create a comprehensive pet care platform supporting unlimited pets and multiple user roles (owners, trainers, vets, groomers).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom pet care color scheme
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Mobile-First Design**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy using sessions
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Real-time Features**: WebSocket integration for chat functionality
- **API Design**: RESTful APIs with type-safe endpoints

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless connection pooling
- **Session Storage**: PostgreSQL tables for session persistence

## Key Components

### Authentication System
- **Strategy**: Session-based authentication with Passport.js
- **Security**: Scrypt password hashing with salt
- **User Roles**: Support for owner, trainer, vet, and groomer roles
- **Authorization**: Route-level protection with user context

### Pet Management
- **Multi-Pet Support**: Unlimited pets per owner
- **Pet Profiles**: Comprehensive pet information (breed, age, weight, medical notes)
- **Media Storage**: Avatar and image support for pets
- **Health Tracking**: Medical records, vaccinations, and activity logs

### Social Features
- **Community Feed**: Posts with images, comments, and likes
- **User Interactions**: Following, commenting, and social engagement
- **Real-time Chat**: WebSocket-powered messaging system
- **Gamification**: XP points, levels, and badge system

### Booking System
- **Provider Discovery**: Browse and book services from trainers, vets, groomers
- **Calendar Integration**: Appointment scheduling and management
- **Service Categories**: Walking, veterinary, grooming, and training services
- **Provider Profiles**: Detailed service provider information

### Health Monitoring
- **Activity Tracking**: Steps, walks, exercise logs
- **Health Records**: Vet visits, medications, vaccinations
- **Real-time Data**: Mock integration points for IoT devices
- **Data Visualization**: Progress tracking and health metrics

## Data Flow

### Client-Server Communication
1. **API Requests**: REST endpoints with JSON payloads
2. **Authentication**: Session cookies for user identification
3. **Real-time Updates**: WebSocket connections for live features
4. **Error Handling**: Centralized error management with toast notifications

### State Management Flow
1. **Server State**: TanStack Query for caching and synchronization
2. **Form State**: React Hook Form for local form management
3. **UI State**: React hooks for component-level state
4. **Global State**: Context providers for auth and theme

### Database Interactions
1. **Query Layer**: Drizzle ORM with type-safe queries
2. **Connection Management**: Pooled connections to PostgreSQL
3. **Schema Evolution**: Migration-based database updates
4. **Data Validation**: Zod schemas for runtime type checking

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool with HMR
- **ESBuild**: Production bundling for server code
- **PostCSS**: CSS processing and autoprefixing

### Database and Backend
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Express.js**: Web server framework
- **WebSocket**: Real-time communication protocol

### Internationalization
- **Custom i18n**: Basic English/Japanese localization support
- **Theme Support**: Light/dark mode with CSS variables

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Automatic browser refresh for rapid development
- **Type Checking**: Continuous TypeScript validation
- **Database**: Local or remote PostgreSQL connection

### Production Build
- **Frontend**: Static build output with Vite
- **Backend**: ESBuild bundling for Node.js deployment
- **Assets**: Optimized images and static file serving
- **Environment**: Environment-based configuration

### Database Management
- **Migrations**: Drizzle Kit for schema updates
- **Seeding**: Programmatic data initialization
- **Backup**: PostgreSQL dump and restore procedures
- **Monitoring**: Connection pooling and query performance

### Security Considerations
- **Session Security**: Secure session configuration
- **CORS**: Appropriate cross-origin policies
- **Input Validation**: Zod schema validation on all inputs
- **Password Security**: Scrypt hashing with proper salt handling

### Scalability Features
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed database queries
- **Caching Strategy**: Client-side query caching with TanStack Query
- **Real-time Scaling**: WebSocket connection management

## Future Enhancement Points

The application is designed to accommodate future features including:
- 3D pet avatar integration
- IoT device connectivity for real-time health monitoring
- GPS tracking for walk routes
- Push notification system
- Mobile app deployment via Expo
- Advanced gamification features
- Provider rating and review system
- Payment processing integration