# Restaurant Daily - Project Plan

## Overview
Mobile-first restaurant performance tracking app with cash management, voucher tracking, and payment monitoring.

## Architecture
- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS (mobile-first)
- **State**: React Context/Zustand
- **Auth**: JWT with phone/OTP
- **Database**: JSON files initially (can upgrade to PostgreSQL/MongoDB)
- **Deployment**: Server with nginx reverse proxy

## Core Features

### Authentication System
- Phone number input
- OTP verification
- Role selection (Admin/Team Member)
- JWT token management

### Dashboard Components
- Cash session overview
- Daily performance metrics
- Quick action buttons
- Navigation menu

### Cash Management
- Start/end cash sessions
- Opening/closing balance
- Transaction tracking
- Session reports

### Voucher Tracking
- Petty cash vouchers
- Expense categories
- Approval workflow
- Receipt attachments

### Payment Monitoring
- Electricity payment tracking
- Due date alerts
- Payment history
- Vendor management

### User Roles
- **Admin**: Full access, reporting, user management
- **Team Member**: Basic tracking, limited reports

## Technical Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state)
- React Hook Form
- Date-fns
- Recharts (analytics)

## Development Phases
1. Project setup & authentication
2. Core dashboard & navigation
3. Cash session management
4. Voucher & payment tracking
5. Role-based features & polish