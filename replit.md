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

### Undo Functionality (June 19, 2025)
✓ Added undo functionality to all three pages (Profit Calculator, Retail Budget, Professional Budget)
✓ Tracks last 10 actions for each page including form changes, supplier additions/removals, and clear actions
✓ Undo button disabled when no actions available to undo
✓ Preserves user workflow and prevents accidental data loss
✓ Fixed undo system to capture state only on first keystroke of editing session
✓ Enter key navigation no longer creates duplicate undo states
✓ Single undo click restores previous complete state (e.g., £500→£600 back to £500)

### Mobile App Version (June 19, 2025)
✓ Implemented responsive mobile-first design for on-the-go access
✓ Collapsible mobile navigation with hamburger menu
✓ Touch-optimized buttons and form controls (44px minimum touch targets)
✓ Mobile-specific supplier management with stacked card layout
✓ Optimized text sizes and spacing for mobile screens
✓ Horizontal scrolling tabs for easy navigation on small screens
✓ Prevents zoom on iOS with proper font sizing for inputs

### Stock Wizard Onboarding (June 19, 2025)
✓ Interactive tutorial with animated demonstrations of key features
✓ Step-by-step walkthrough of Profit Calculator, Retail Budget, and Professional Budget
✓ Animated examples showing real calculations and workflows
✓ Keyboard shortcuts and pro tips section
✓ Automatic display for new users with option to replay anytime
✓ Framer Motion animations for engaging user experience
✓ Progress tracking and completion rewards

### Deployment Preparation (June 19, 2025)
✓ Created comprehensive deployment guide for Render platform
✓ Added render.yaml configuration file for automated deployment
✓ Updated package.json with production build scripts
✓ Documented environment variables and system requirements
✓ Prepared README.txt and DEPLOYMENT_GUIDE.txt for easy setup
✓ Configured proper build commands and health checks
✓ Ready for seamless migration to external hosting platforms

## Changelog
- June 19, 2025: Initial setup and major enhancements
- June 19, 2025: Fixed undo functionality to work correctly with Enter key navigation
- June 19, 2025: Added Stock Wizard interactive onboarding tutorial with animations
- June 19, 2025: Prepared deployment configuration for Render hosting platform

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication: Username/password system without email verification - suitable for salon environment where admin can help users directly.