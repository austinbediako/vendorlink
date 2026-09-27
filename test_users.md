# Test Users & Manual Testing Guide

This document contains login credentials for the seeded demo accounts and step-by-step walkthroughs for testing the Vendor Management System.

**All test accounts use the same password:** `password123`

---

## Test Accounts

| Email | Role | Purpose |
| :---- | :--- | :------ |
| `admin@vms.com` | Admin | Verify artisans and resolve disputes |
| `business.open@vms.com` | Business | Has an open electrical request waiting for applications |
| `business.direct@vms.com` | Business | Has an accepted direct carpentry booking with a dispute |
| `business.completed@vms.com` | Business | Completed welding job; can leave a rating (already rated) |
| `artisan.electrician@vms.com` | Artisan | Verified electrician with a pending application |
| `artisan.plumber.pending@vms.com` | Artisan | Pending verification (not yet approved by admin) |
| `artisan.carpenter@vms.com` | Artisan | Verified carpenter on an accepted direct booking |
| `artisan.welder@vms.com` | Artisan | Verified welder with a completed job and 5-star rating |
| `artisan.incomplete@vms.com` | Artisan | Profile not completed — use to test the onboarding prompt and map reverse geocoding |

---

## Quick Start

1. Start the backend and frontend (see `README.md`).
2. Open `http://localhost:5173` in your browser.
3. Use any account above with password `password123`.

---

## Test Walkthroughs

### 1. Admin verifies a pending artisan

1. Login as `admin@vms.com`.
2. Go to **Admin Dashboard**.
3. Click **Verify Artisans** or navigate to `/admin/artisans`.
4. Find `Kofi Boateng` (plumber) with status **Pending**.
5. Click the green checkmark to verify.
6. The artisan can now log in and use the platform.

### 2. Artisan signs up and completes profile

1. Click **Register** and create a new artisan account.
2. After registration, you are redirected to **Complete Your Artisan Profile**.
3. Fill in name, bio, years of experience, phone, and select at least one service category.
4. Enter a location name and click a point on the map.
5. Click **Continue to Dashboard**.
6. You can now browse requests matching your selected categories.

### 3. Business posts a request and approves an artisan

1. Login as `business.open@vms.com`.
2. Go to **Service Requests** → **New Request**.
3. Fill in the title, select a category, description, location name, click the map for exact location, choose a preferred date, and budget.
4. Submit the request.
5. (Optional) Login as `artisan.electrician@vms.com`, browse requests, and click **Apply** on the new request.
6. Log back in as `business.open@vms.com`, open the request, and view the **Applicants** section.
7. Click **Approve & Create Booking**.
8. The request closes and an accepted booking is created. Both sides can now see exact locations.

### 4. Artisan sees only category-matched requests

1. Login as `artisan.carpenter@vms.com` (categories: Carpentry).
2. Go to **Service Requests**.
3. Only carpentry-related open requests are visible.
4. Electrical or plumbing requests are not shown.
5. Each request card shows only the rough location (e.g., "East Legon"), marked as **approximate**.

### 5. Direct booking flow and location reveal

1. Login as `business.direct@vms.com`.
2. Go to **Find Artisans**, find `Yaw Osei` (carpenter).
3. Click **Book This Artisan**, set a price and date, then confirm.
4. A booking is created with status **Requested**.
5. Login as `artisan.carpenter@vms.com`, go to **My Jobs**.
6. Open the booking. Notice the exact business location is hidden.
7. Click **Accept**.
8. Exact location and map now appear for both sides.

### 6. Business rates artisan after completed job

1. Login as `business.completed@vms.com`.
2. Go to **My Bookings**.
3. Open the completed welding job.
4. Submit a rating and review (already seeded, but you can see the rating form).
5. Login as `artisan.welder@vms.com` to see the rating on the dashboard/profile.

### 7. Admin resolves a dispute

1. Login as `business.direct@vms.com`.
2. Open the direct carpentry booking and raise a dispute (already seeded).
3. Login as `admin@vms.com`.
4. Go to **Admin Dashboard** → **Resolve Disputes**.
5. Open the dispute, enter resolution notes, and click **Resolve**.
6. Login back as `business.direct@vms.com` or `artisan.carpenter@vms.com` to see the resolved status.

### 8. Test artisan onboarding prompt and reverse geocoding

1. Login as `artisan.incomplete@vms.com`.
2. Try to visit `/dashboard` or `/service-requests`.
3. A prompt appears: **Complete Your Profile** with a **Go to Profile Setup** button.
4. Click **Go to Profile Setup**.
5. Fill in your name, phone, years of experience, and select service categories.
6. Click on the map. The **Location Name** field should auto-fill with a human-readable address from OpenStreetMap.
7. Submit the profile. You can now browse requests and use the dashboard.

---

## Location Privacy Reminders

- Exact coordinates are hidden on public artisan profiles until a business has an accepted booking with that artisan.
- Exact coordinates are hidden from artisans browsing service requests until the business approves their application (or the artisan accepts a direct booking).
- Approximate location names (e.g., city/area) are always visible to help users decide whether to engage.

---

## Seeded Data Summary

- **Service categories**: Electrical, Plumbing, Carpentry, Welding, Tailoring, Masonry, Painting, General Maintenance
- **Open requests**: 1 (electrical, from `business.open@vms.com`)
- **Pending applications**: 1 (electrician applied to open request)
- **Accepted direct bookings**: 1 (carpenter)
- **Completed bookings with ratings**: 1 (welder, 5 stars)
- **Open disputes**: 1 (on the carpenter direct booking)
- **Pending artisan verifications**: 1 (plumber)
- **Incomplete artisan profiles**: 1 (for onboarding prompt testing)

Use these scenarios to demonstrate discovery, booking, privacy, verification, rating, dispute resolution, and onboarding during your defense or demo.
