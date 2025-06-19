# Stockit - Salon Stock Management System

## Overview

Stockit is a comprehensive salon stock management system designed to help salon owners efficiently manage their inventory budgets and calculate profit margins. The application provides three core modules: a profit calculator for individual products, a retail budget manager, and a professional stock budget tracker. Built with modern web technologies, it offers an intuitive interface optimized for display screens with clear, readable layouts.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints
- **Data Validation**: Zod schemas for request/response validation
- **File Processing**: XLSX for Excel export functionality

### Key Components

#### Database Schema
The application uses a PostgreSQL database with the following main tables:
- `users`: User authentication and management
- `profit_scenarios`: Stored profit calculations for comparison
- `retail_budgets`: Retail stock budget configurations
- `retail_suppliers`: Supplier allocations for retail budgets
- `professional_budgets`: Professional service budget tracking
- `professional_suppliers`: Professional service supplier management

#### API Structure
- `/api/profit-scenarios`: CRUD operations for profit calculations
- `/api/retail-budget`: Retail budget management endpoints
- `/api/professional-budget`: Professional budget management endpoints
- `/api/export/*`: Excel export functionality for all modules

#### Storage Layer
The application implements an abstraction layer for data storage with both in-memory (development) and PostgreSQL (production) implementations, allowing for flexible deployment and testing scenarios.

## Data Flow

1. **User Input**: Users interact with form components built with React Hook Form
2. **Validation**: Client-side validation using Zod schemas before API calls
3. **API Processing**: Express.js handles requests, validates data, and interacts with database
4. **Database Operations**: Drizzle ORM manages database queries and migrations
5. **Response Handling**: TanStack Query manages caching and optimistic updates
6. **UI Updates**: React components re-render based on updated query state

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider for production
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Platform
- **Replit**: Cloud-based development and deployment platform
- **Autoscaling**: Configured for automatic scaling based on demand

### Build Process
1. **Development**: `npm run dev` runs concurrent frontend (Vite) and backend (tsx) processes
2. **Production Build**: 
   - Frontend: Vite builds optimized client-side bundle
   - Backend: ESBuild creates Node.js compatible server bundle
3. **Deployment**: Replit handles deployment with build and start scripts

### Environment Configuration
- PostgreSQL module enabled for database functionality
- Port 5000 configured for external access
- Environment variables for database connection strings

## Recent Changes

### Authentication & User Management (June 19, 2025)
✓ Implemented Replit OAuth authentication system
✓ Added user-specific data isolation
✓ Created landing page for non-authenticated users
✓ Added logout functionality in header

### VAT Calculation Enhancement (June 19, 2025)
✓ Added VAT percentage field to profit calculator
✓ Implemented VAT-inclusive RRP calculations (Example: £30 RRP with 20% VAT = £25 net)
✓ User's VAT percentage saved as default for future calculations
✓ VAT display in profit summary when registered

### UI/UX Improvements (June 19, 2025)
✓ Increased font sizes throughout application for large screen readability
✓ Enhanced keyboard navigation with Enter key field progression
✓ Larger input fields (text-xl, h-12) and buttons
✓ Improved tooltips and labels with larger text
✓ Better visual hierarchy with larger headings

### Database Integration (June 19, 2025)
✓ Migrated from in-memory to PostgreSQL storage
✓ User-specific data separation for all features
✓ Session management with database storage
✓ Updated schema with user references and VAT fields

## Changelog
- June 19, 2025. Initial setup and major enhancements

## User Preferences

Preferred communication style: Simple, everyday language.