# GitHub Repository Dashboard

A modern, clean monitoring dashboard for tracking GitHub repositories, managing dependencies, and visualizing system architecture.

## Features

- **Repository Overview**: Unified view of all GitHub repositories with quick status indicators
- **Dependency Management**: Monitor outdated packages and security vulnerabilities
- **Architecture Visualization**: Auto-generated system architecture diagrams
- **Error & Log Tracking**: Centralized logging and error monitoring
- **User Authentication**: Session-based authentication with secure password hashing

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js + Passport.js
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket support via ws library
- **Deployment**: Railway.app

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub Personal Access Token

### Installation

1. Clone the repository
2. Navigate to dashboard directory: `cd dashboard`
3. Install dependencies: `npm install`
4. Create `.env` file with required variables (see `.env.example`)
5. Run migrations: `npm run db:push`

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key (min 32 characters)
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `SYNC_INTERVAL_MINUTES`: Sync frequency (default: 60)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   └── App.tsx      # Main router
│   ├── index.html
│   └── index.tsx
├── server/              # Express backend
│   ├── services/        # Business logic
│   ├── jobs/            # Background jobs
│   ├── db.ts            # Database setup
│   ├── auth.ts          # Authentication
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data access
│   └── index.ts         # Server entry
├── shared/              # Shared code
│   └── schema.ts        # Database schema
├── migrations/          # Drizzle migrations
└── package.json
```

## Implementation Phases

### Phase 1: MVP (Current)
- Basic dashboard with repository listing
- Dependency tracking
- Manual sync capability

### Phase 2: Vulnerability Detection
- Security vulnerability scanning
- Severity-based filtering
- Remediation suggestions

### Phase 3: Architecture Visualization
- Auto-generated dependency graphs
- Module structure visualization
- Export to SVG/PNG

### Phase 4: Polish & Optimization
- Performance tuning
- Multi-user support
- Advanced features

## Testing

```bash
npm test
```

## Deployment

Deploy to Railway.app:

```bash
npm run build
git push
```

Configure Cloudflare DNS to point `postiusgroup.com` to Railway.

## License

MIT
