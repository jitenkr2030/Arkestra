# Orchestra Management System - Specification

## Project Overview

**Project Name**: SymphonyHub - Orchestra Management Platform  
**Project Type**: Full-stack Next.js Web Application  
**Core Functionality**: Comprehensive orchestra management system including event management, member scheduling, client CRM, payment tracking, and calendar integration  
**Target Users**: Orchestra administrators, music directors, members, and clients

---

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Calendar**: FullCalendar integration
- **State Management**: React hooks and server actions

---

## Database Schema

### Models

#### User
- id, email, name, password (hashed), role (ADMIN, MEMBER, CLIENT), createdAt, updatedAt

#### Orchestra
- id, name, description, logo, contactEmail, contactPhone, address, createdAt, updatedAt

#### Member
- id, userId, instrument, position, hourlyRate, bio, emergencyContact, emergencyPhone, createdAt, updatedAt

#### Event
- id, orchestraId, title, description, eventType (CONCERT, REHEARSAL, PERFORMANCE, OTHER), location, startTime, endTime, status (SCHEDULED, CONFIRMED, CANCELLED, COMPLETED), notes, createdAt, updatedAt

#### Repertoire
- id, eventId, title, composer, duration, arrangement, notes, createdAt, updatedAt

#### Booking
- id, eventId, memberId, status (PENDING, CONFIRMED, DECLINED, CANCELLED), paymentStatus (UNPAID, PARTIAL, PAID), paymentAmount, notes, createdAt, updatedAt

#### Client
- id, userId, company, contactPerson, phone, address, notes, createdAt, updatedAt

#### Payment
- id, bookingId, amount, paymentDate, paymentMethod (CASH, BANK_TRANSFER, CARD, OTHER), reference, notes, createdAt, updatedAt

#### Notification
- id, userId, type (BOOKING, EVENT, PAYMENT, AVAILABILITY, SYSTEM), title, message, read, relatedId, createdAt, updatedAt

#### Availability
- id, memberId, date, status (AVAILABLE, UNAVAILABLE, TENTATIVE), reason, createdAt, updatedAt

---

## Feature Specifications

### 1. Authentication System
- NextAuth.js with credentials provider
- Role-based access control (ADMIN, MEMBER, CLIENT)
- Session management with JWT
- Protected routes based on authentication and roles

### 2. Orchestra Management
- Create, read, update orchestra profiles
- Manage orchestra settings and branding
- Multi-orchestra support (future)

### 3. Event Management
- Full CRUD operations for events
- Event types: Concert, Rehearsal, Performance, Other
- Status tracking and management
- Event notes and documentation

### 4. Booking Management
- Create bookings for events
- Member assignment and tracking
- Booking status workflow
- Payment status integration

### 5. Member Management
- Member profiles with instrument specialization
- Availability tracking system
- Hourly rate management
- Contact information management

### 6. Repertoire Management
- Manage event setlists
- Track compositions and arrangements
- Duration and composer information

### 7. Client Management (CRM)
- Client profiles and contact management
- Company and contact person tracking
- Notes and interaction history
- Client-specific event history

### 8. Payment Tracking
- Payment recording per booking
- Multiple payment methods
- Payment history and references
- Financial reporting basics

### 9. Notification System
- Real-time notifications
- Notification types: Booking, Event, Payment, Availability, System
- Read/unread status tracking
- Related entity linking

### 10. Calendar Integration
- FullCalendar integration
- Event visualization
- Availability display
- Booking overview

### 11. Dashboard
- Overview statistics
- Upcoming events
- Recent bookings
- Pending payments
- Quick actions

---

## UI/UX Design Direction

### Visual Style
- Modern, professional design with clean lines
- Dark sidebar navigation with light content area
- Card-based layouts for data display
- Responsive design for all screen sizes

### Color Scheme
- Primary: Deep Purple (#6366f1)
- Secondary: Slate Gray (#64748b)
- Accent: Emerald (#10b981)
- Background: White and Gray tones
- Text: Slate grays for readability
- Status colors: Green (success), Yellow (warning), Red (error)

### Layout Approach
- Sidebar navigation with main content area
- Dashboard as home page
- Nested routes for resource management
- Modal forms for create/edit operations
- Tables for data listing with pagination

---

## Page Structure

### Public Pages
- /login - Authentication page

### Protected Pages (All Users)
- /dashboard - Main dashboard
- /calendar - Calendar view

### Admin Pages
- /orchestras - Orchestra management
- /events - Event management
- /bookings - Booking management
- /members - Member management
- /repertoire - Repertoire management
- /clients - Client management
- /payments - Payment tracking
- /notifications - Notification center
- /settings - Application settings

### Member Pages
- /my-availability - Personal availability
- /my-bookings - Personal booking history

---

## API Routes Structure

### /api/auth/* - Authentication
- [...nextauth] - NextAuth handlers

### /api/orchestras/* - Orchestra CRUD
### /api/events/* - Event CRUD
### /api/bookings/* - Booking CRUD
### /api/members/* - Member CRUD
### /api/repertoire/* - Repertoire CRUD
### /api/clients/* - Client CRUD
### /api/payments/* - Payment CRUD
### /api/notifications/* - Notification CRUD
### /api/availability/* - Availability CRUD

---

## Security Considerations

- Password hashing with bcrypt
- JWT token validation
- Input validation and sanitization
- Role-based route protection
- API route protection
- CORS configuration