STOCKIT - SALON STOCK MANAGEMENT SYSTEM
=======================================

QUICK START GUIDE
-----------------
1. npm install
2. Set up environment variables (see DEPLOYMENT_GUIDE.txt)
3. npm run db:push (setup database)
4. npm run build
5. npm run start

DEVELOPMENT
----------
npm run dev - Start development server
npm run build - Build for production
npm run start - Start production server
npm run db:push - Update database schema

FEATURES
--------
✓ Profit Calculator with VAT calculations
✓ Retail Budget Manager 
✓ Professional Stock Budget
✓ Multi-currency support
✓ Mobile responsive design
✓ Interactive tutorial
✓ Excel export
✓ User authentication
✓ Undo functionality

TECH STACK
----------
Frontend: React 18, TypeScript, Tailwind CSS, Vite
Backend: Express.js, TypeScript
Database: PostgreSQL with Drizzle ORM
Authentication: Replit OAuth
UI: Radix UI + shadcn/ui components

DEPLOYMENT
----------
See DEPLOYMENT_GUIDE.txt for complete deployment instructions for Render.

BROWSER SUPPORT
--------------
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

MOBILE SUPPORT
-------------
- iOS Safari 14+
- Android Chrome 90+
- Responsive design optimized for tablets and phones

FILE STRUCTURE
-------------
/client/src/          - React frontend source
/server/              - Express backend source  
/shared/              - Shared TypeScript types
/dist/                - Built application (generated)
package.json          - Dependencies and scripts
DEPLOYMENT_GUIDE.txt  - Detailed deployment instructions
SYSTEM_REQUIREMENTS.txt - Complete system requirements
render.yaml           - Render deployment configuration

For detailed deployment instructions, see DEPLOYMENT_GUIDE.txt
For system requirements, see SYSTEM_REQUIREMENTS.txt