# KitabGhar E-Book Management System

## Overview

KitabGhar is a full-stack e-book management system that allows users to browse, bookmark, review, and download e-books. The application features a dual-interface design: a user-facing discovery experience for browsing books and an admin dashboard for content management. The system supports user authentication with JWT tokens, book categorization, ratings/reviews, reading progress tracking, and file uploads for book covers and content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth and theme
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with tsx for development
- **API Design**: RESTful JSON API with JWT authentication
- **File Handling**: Multer for multipart uploads (book covers and files stored in /uploads)
- **Authentication**: JWT tokens with bcryptjs password hashing

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Database**: PostgreSQL (requires DATABASE_URL environment variable)

### Key Data Models
- **Users**: Authentication with roles (user/admin), blocking capability
- **Books**: Title, author, description, category, cover image, book file, download count
- **Categories**: Book categorization system
- **Reviews**: User ratings and comments on books
- **Bookmarks**: User's saved books
- **ReadingProgress**: Track user's reading position in books
- **Downloads**: Track download history

### Authentication Flow
- Admin credentials are hardcoded: admin741777@gmail.com / Admin@741
- JWT tokens stored in localStorage on client
- Protected routes check for valid token and admin role where needed
- Auth context provides login, register, logout functions

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route components (Home, Books, Admin/*)
    lib/          # Utilities, auth, theme, query client
    hooks/        # Custom React hooks
server/           # Express backend
  routes.ts       # API endpoints
  storage.ts      # Data access layer
  db.ts           # Database connection
shared/           # Shared code
  schema.ts       # Drizzle database schema
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via DATABASE_URL environment variable
- **Drizzle Kit**: Database migrations and schema management (db:push command)

### Authentication
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing

### File Storage
- Local filesystem storage in /uploads directory (covers/ and books/ subdirectories)
- Multer handles multipart form uploads

### UI Components
- **@radix-ui/***: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-styled component library built on Radix
- **lucide-react**: Icon library
- **framer-motion**: Animation library

### Key NPM Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production (Vite for client, esbuild for server)
- `npm run db:push`: Push schema changes to database