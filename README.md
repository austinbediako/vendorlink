# VendorLink - Web-Based Vendor Management System

A web-based platform that connects businesses in Ghana with verified artisans and service providers. This project supports three user roles: **businesses**, **artisans/service providers**, and **administrators**.

## Features

- **Business Accounts**: Post service requests with map-based location selection and calendar date picking, discover artisans by category/location/rating, book providers directly or review artisan applications, track jobs, and submit ratings.
- **Artisan Accounts**: Complete a mandatory profile after signup, create verifiable profiles with map-based location selection, browse open service requests matched to their selected categories, apply for jobs, update job status, and build a reputation through reviews.
- **Location Privacy**: Exact locations are hidden from both parties until a booking is accepted or an application is approved.
- **Administrator Dashboard**: Verify artisan registrations, monitor platform activity, and resolve disputes.

## Tech Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, TanStack Query (React Query), Axios, Lucide React icons
- **Backend**: Node.js, Express, JWT authentication, express-validator
- **Database**: PostgreSQL

## Project Structure

```
vendor-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── components/     # Reusable UI components and route guards
│   │   ├── context/        # React contexts (AuthContext, ToastContext)
│   │   ├── hooks/          # TanStack Query hooks
│   │   ├── lib/            # Query client and utilities
│   │   ├── pages/          # Application pages
│   │   ├── routes.jsx      # Centralized role-based route config
│   │   └── services/       # API service (Axios)
│   └── package.json
├── server/                 # Express backend
│   ├── db/                 # Database schema, setup, and seed scripts
│   ├── middleware/         # Auth and validation middleware
│   ├── routes/             # API route handlers
│   ├── tests/              # Jest + Supertest API tests
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm or npm

### 1. Clone and Enter the Project

```bash
cd vendor-management-system
```

### 2. Set Up the Database

Start PostgreSQL and create a database named `vendor_management`:

```bash
psql postgres -c "CREATE DATABASE vendor_management;"
```

### 3. Configure the Backend

```bash
cd server
cp .env.example .env
# Edit .env with your database URL if different
```

Default `.env`:

```env
PORT=5001
DATABASE_URL=postgresql://localhost:5432/vendor_management
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

### 4. Install Dependencies and Seed the Database

```bash
pnpm install
pnpm run db:reset
```

### 5. Start the Backend

```bash
pnpm dev
```

The API will run on `http://localhost:5001`.

### 6. Start the Frontend

In a new terminal:

```bash
cd ../client
pnpm install
pnpm dev
```

The frontend will run on `http://localhost:5173`.

### 7. Demo Accounts

After seeding, several demo accounts are available. All use the password `password123`. See `test_users.md` for the full list and walkthroughs.

| Email                 | Password     | Role      |
| --------------------- | ------------ | --------- |
| `admin@vms.com`       | `password123` | Admin     |
| `business@vms.com`    | `password123` | Business  |
| `artisan@vms.com`     | `password123` | Artisan   |

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a business or artisan account
- `POST /api/auth/login` - Authenticate and receive a JWT
- `GET /api/auth/me` - Get current user details

### Profiles

- `GET /api/profile` - Get current profile
- `GET /api/profile/completeness` - Check whether an artisan profile is complete enough to use the platform
- `PUT /api/profile` - Update current profile

### Artisans

- `GET /api/artisans?location=&category=&minRating=` - Search and filter artisans
- `GET /api/artisans/:id` - View artisan public profile and reviews

### Service Requests

- `GET /api/service-requests` - List requests (business: own, artisan: open and matching their categories, with exact location masked)
- `GET /api/service-requests/categories` - List service categories
- `POST /api/service-requests` - Create a new service request (business)
- `GET /api/service-requests/:id` - View request details (exact location masked for artisans until approved)
- `PUT /api/service-requests/:id` - Update request status (business)
- `POST /api/service-requests/:id/apply` - Artisan applies to a matching open request
- `GET /api/service-requests/:id/applications` - Business views applicants for its own request
- `PUT /api/service-requests/:id/applications/:applicationId/approve` - Business approves an applicant and creates an accepted booking

### Bookings

- `GET /api/bookings` - List bookings for current user
- `GET /api/bookings/:id` - View booking details and status history
- `POST /api/bookings` - Create a booking (business)
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/disputes` - Raise a dispute

### Ratings

- `POST /api/ratings/:bookingId` - Rate an artisan after job completion

### Admin

- `GET /api/admin/dashboard` - Platform statistics
- `GET /api/admin/artisans` - List artisan verifications
- `PUT /api/admin/artisans/:id/verify` - Verify or reject artisan
- `GET /api/admin/disputes` - List disputes
- `PUT /api/admin/disputes/:id/resolve` - Resolve or dismiss dispute

## Running Tests

```bash
cd server
pnpm test
```

## Key Workflows

### Business User

1. Register as a business.
2. Complete profile (Edit Profile).
3. Post a service request or browse artisans directly.
4. Book an artisan and track job status.
5. Submit a rating after the job is completed.

### Artisan User

1. Register as an artisan.
2. Complete the mandatory profile setup (name, categories, location, phone).
3. Wait for admin verification (or use seeded verified account).
4. Browse available service requests that match your selected categories.
5. Apply to requests you are interested in. Exact location is hidden until the business approves your application.
6. Alternatively, accept direct bookings from businesses.
7. Update job status as work progresses. Exact business location is revealed once the booking is accepted.

### Administrator

1. Log in with admin credentials.
2. Review pending artisan verifications.
3. Monitor and resolve disputes raised by users.

## Future Work

- Live payment gateway integration
- Native mobile application
- In-app messaging between business and artisan
- Nationwide vendor onboarding campaign

## License

This is an academic project submitted in partial fulfillment of the requirements for a Bachelor of Science degree in Information Technology at the University of Ghana.
