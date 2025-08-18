# Smart Attendance System - Frontend

A modern, responsive web application for employee and visitor attendance tracking built with React and Tailwind CSS.

## Features

### 🏠 Home Page
- Clean, modern landing page
- Easy navigation to employee or visitor sections
- Feature overview and instructions

### 👥 Employee Clock In/Out
- Search employees by name, ID, or department
- Real-time employee filtering
- One-click clock in/out functionality
- Automatic timestamp recording
- Success/error feedback messages

### 🚶 Visitor Management  
- Multi-step visitor registration process
- Visitor information collection (name, phone)
- Host employee selection
- Visitor clock in/out tracking
- Complete visit logging

### 🔐 Admin Dashboard
- Secure admin authentication
- Employee management (view, add, edit, delete)
- Real-time attendance monitoring
- Visitor logs and reports
- Export functionality for records
- Activity dashboard with statistics

## Technology Stack

- **React 19.1.1** - Modern React with latest features
- **React Router DOM 7.1.5** - Client-side routing
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons
- **Vite 7.1.0** - Fast build tool and dev server
- **Bun** - Fast package manager and runtime

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## API Integration

The frontend connects to the backend API with these key endpoints:
- Employee management and clock in/out
- Visitor registration and tracking
- Admin authentication and dashboard
- Attendance record management

## Application Structure

- **HomePage**: Landing page with navigation options
- **EmployeePage**: Employee search and clock in/out
- **VisitorPage**: Multi-step visitor registration and clock tracking
- **AdminLogin**: Secure admin authentication
- **AdminPage**: Comprehensive admin dashboard with employee management and reporting

The application is fully responsive and provides an intuitive user experience across all device types.
