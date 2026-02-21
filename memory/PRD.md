# FarmTrack Pro - PRD

## Problem Statement
Build an app to keep track of all services on farm tractors and vehicles - tracking filters used for services on tractors, service dates, mileage/hours, costs, and technician notes. Include service reminders/alerts and filter inventory management.

## User Persona
- **Primary**: Farm owners, farm managers
- **Secondary**: Equipment technicians, maintenance staff
- **Context**: Field use, often in rugged conditions requiring high-contrast, easy-to-use interfaces

## Core Requirements
1. **Equipment Management** - Track tractors, vehicles, and other farm equipment
2. **Service Records** - Log maintenance with filter usage, dates, hours/mileage, costs
3. **Filter Inventory** - Track filter stock with low-stock alerts
4. **Service Reminders** - Date-based, hours-based, or mileage-based alerts
5. **No Authentication** - Simple single-user access

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Design**: Industrial Pragmatist theme (Barlow Condensed + Inter fonts)

## What's Implemented (Jan 2026)

### Backend (FastAPI)
- [x] Equipment CRUD endpoints (tractors, vehicles, other)
- [x] Service Records CRUD with filter tracking
- [x] Filter Inventory CRUD with low-stock detection
- [x] Service Reminders CRUD (date/hours/mileage-based)
- [x] Dashboard stats and alerts API
- [x] Auto-update equipment hours/mileage on service
- [x] Auto-decrement filter stock on service

### Frontend (React)
- [x] Dashboard with overview stats, alerts, recent services
- [x] Equipment listing with search/filter
- [x] Equipment detail page with service history
- [x] Service records management with filter selection
- [x] Filter inventory with low-stock alerts
- [x] Service reminders with status tracking
- [x] Mobile-responsive design
- [x] Industrial "heavy machinery" UI theme

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/equipment | List all equipment |
| POST | /api/equipment | Create equipment |
| GET | /api/equipment/{id} | Get equipment details |
| PUT | /api/equipment/{id} | Update equipment |
| DELETE | /api/equipment/{id} | Delete equipment |
| GET | /api/filters | List all filters |
| GET | /api/filters/low-stock | Get low-stock filters |
| POST | /api/filters | Create filter |
| PUT | /api/filters/{id} | Update filter |
| DELETE | /api/filters/{id} | Delete filter |
| GET | /api/services | List all services |
| GET | /api/services/equipment/{id} | Get equipment services |
| POST | /api/services | Create service record |
| PUT | /api/services/{id} | Update service |
| DELETE | /api/services/{id} | Delete service |
| GET | /api/reminders | List all reminders |
| POST | /api/reminders | Create reminder |
| PUT | /api/reminders/{id} | Update reminder |
| DELETE | /api/reminders/{id} | Delete reminder |
| GET | /api/dashboard/stats | Get dashboard stats |
| GET | /api/dashboard/alerts | Get active alerts |
| GET | /api/dashboard/recent-services | Get recent services |

## Backlog

### P0 (Critical)
- All core features implemented ✅

### P1 (High Priority)
- Export service reports to PDF/CSV
- Email notifications for reminders
- Bulk import equipment from CSV

### P2 (Nice to Have)
- Equipment photos upload
- QR code scanning for equipment
- Maintenance cost analytics/charts
- Multi-user access with roles

## Next Tasks
1. Add export functionality (PDF/CSV reports)
2. Implement email notifications for service reminders
3. Add bulk import for equipment data
