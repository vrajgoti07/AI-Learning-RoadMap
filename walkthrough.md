# PathFinder AI - Project Walkthrough

## 1. Authentication & Security
- **JWT Refresh Flow**: Implemented a secure authentication system with short-lived access tokens and long-lived rotation-based refresh tokens.
- **Role-Based Access (RBAC)**: Added dependencies to protect routes based on user roles (`USER` vs `ADMIN`).
- **OTP Password Reset**: Replaced link-based resets with a more secure 6-digit OTP system stored in Redis (5-min expiry).

## 2. User Progress & Roadmaps
- **Atomic Progress**: Users can mark roadmap nodes as complete. Progress is stored as an array of IDs in MongoDB, updated atomically via `PATCH /api/roadmaps/:id/progress`.
- **AI Roadmap Generation**: Integrated Gemini AI to generate structured learning paths with enriched YouTube video resources.

## 3. Subscriptions & Payments
- **Razorpay Integration**: Implemented a full payment flow with backend order creation (`/subscriptions/create-order`) and secure HMAC signature verification (`/subscriptions/verify`).

## 4. Real-Time Notifications (WebSockets)
- **Live Hub**: Created a `ConnectionManager` in `backend/app/websockets/manager.py` to handle authenticated socket connections.
- **Pulsing Alerts**: When a notification is created, the backend pushes a message to the frontend, causing the Notification Bell to pulse an indigo unread badge instantly.

## 5. Activity Logging & Admin Analytics
- **Audit Logs**: Every major action (Logins, Generates, Payments) is logged via `ActivityLogService`.
- **Admin Dashboard**: New endpoints in `admin.py` allow administrators to view system-wide stats and a live feed of all platform activities.


## How to Verify
1.  **Start Backend**: `cd backend && python -m uvicorn app.main:app --reload`
2.  **Start Frontend**: `cd frontend && npm run dev`
3.  **Test Live Alerts**: Send a `POST` to `/api/notifications/test` and watch the notification bell pulse.
4.  **Check Logs**: Access `/api/admin/activity-logs` as an admin to see your recent actions.
