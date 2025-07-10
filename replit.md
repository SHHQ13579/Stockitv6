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
- **Render**: Cloud-based deployment platform for production
- **Autoscaling**: Configured for automatic scaling based on demand
- **Development**: Local development with Replit (optional)

### Build Process
1. **Development**: `npm run dev` runs concurrent frontend (Vite) and backend (tsx) processes
2. **Production Build**: 
   - Frontend: Vite builds optimized client-side bundle
   - Backend: ESBuild creates Node.js compatible server bundle
3. **Deployment**: Render handles deployment with build and start scripts

### Environment Configuration
- PostgreSQL database via Render managed service
- Port 5000 configured for external access
- Environment variables for database connection strings and email service

## Recent Changes

### Authentication & User Management (June 19, 2025)
✓ Implemented independent username/password authentication system
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

### Render Independence (July 5, 2025)
✓ Removed all Replit-specific dependencies and code
✓ Replaced Replit OAuth with custom username/password authentication
✓ Updated email URL generation to use FRONTEND_URL environment variable
✓ Removed Replit development banner and vite plugins
✓ Updated render.yaml with proper environment variables
✓ Application now fully independent and ready for Render deployment

### Email Integration (July 5, 2025)
✓ Integrated Brevo email service for password reset functionality
✓ Replaced console-logging system with professional email delivery
✓ Added branded email template with clear reset instructions
✓ Implemented fallback to console logging if email service fails
✓ Updated password reset forms with better user feedback
✓ Fixed domain URL generation for proper email links

### Complete Render Independence (July 5, 2025)
✓ Removed all Replit-specific dependencies from package.json
✓ Eliminated all Replit environment variables and references
✓ Updated email system to use FRONTEND_URL and RENDER_EXTERNAL_URL
✓ Removed Replit development banner from HTML template
✓ Confirmed authentication system works independently 
✓ Verified email delivery system uses generic domain detection
✓ Application now 100% ready for Render deployment

### Authentication System Removal (July 10, 2025)
✓ Completely removed password authentication system per user requirement
✓ Eliminated all Brevo email integration and password reset functionality
✓ Removed all user-related database schemas and authentication middleware
✓ Simplified App.tsx to provide direct access without login barriers
✓ Updated storage system to work without user isolation
✓ Removed authentication components, routes, and related files
✓ Simplified frontend components to remove authentication dependencies
✓ Application now provides instant access to stock management features
✓ Maintained full functionality while eliminating authentication complexity

### Stock Wizard Enhancement (July 10, 2025)
✓ Added "Don't show again" checkbox option to opening tutorial wizard
✓ Users can now permanently disable the tutorial from appearing on future visits
✓ Checkbox setting saves to localStorage when wizard is closed or completed
✓ Updated wizard logic to respect user's preference and skip display
✓ Tutorial remains accessible via "Tutorial" button in header for manual access
✓ Improved user experience by preventing unwanted tutorial interruptions

### Complete Database Migration (July 10, 2025)
✓ Fixed critical database schema mismatch that was preventing scenario saves
✓ Removed user_id columns from profit_scenarios, retail_budgets, and professional_budgets tables
✓ Removed all authentication-related database tables (sessions, password_reset_tokens, users)
✓ Database now fully matches code schema without authentication dependencies
✓ All stock management features working correctly with direct database access
✓ Profit calculator scenario saving and loading working perfectly

### Final Render Deployment Readiness (July 10, 2025)
✓ Updated render.yaml configuration to remove authentication environment variables
✓ Cleaned up deployment guide to remove all Replit and authentication references
✓ Simplified environment requirements to only DATABASE_URL
✓ Application is now 100% ready for independent Render deployment
✓ No Replit dependencies remaining in production configuration
✓ Confirmed all core features working: profit calculator, retail budget, professional budget

## Changelog
- June 19, 2025: Initial setup and major enhancements
- June 19, 2025: Fixed undo functionality to work correctly with Enter key navigation
- June 19, 2025: Added Stock Wizard interactive onboarding tutorial with animations
- June 19, 2025: Prepared deployment configuration for Render hosting platform
- July 5, 2025: Achieved complete independence from Replit for deployment
- July 10, 2025: Removed entire authentication system for direct access

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication: NO authentication system - direct access to stock management features.
Deployment: Must be completely independent of Replit for deployment on Render server.