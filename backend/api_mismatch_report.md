# API Mismatch & Missing Endpoints Report

The following inconsistencies between the Frontend requests and Backend routes were identified. These mismatches are the primary cause of the "Failed to fetch" errors.

## Identified Mismatches

| Frontend Request | Backend Route (Current) | Status | Fix Required |
| --- | --- | --- | --- |
| `GET /admin/stats` | `/api/admin/stats` | ❌ Partial | Prefix mismatch |
| `GET /admin/plan-distribution` | `/api/admin/plan-distribution` | ❌ Partial | Prefix mismatch |
| `GET /admin/roadmap-trends` | `/api/admin/roadmap-trends` | ❌ Partial | Prefix mismatch |
| `GET /admin/recent-activity` | `/api/admin/recent-activity` | ❌ Partial | Prefix mismatch |
| `GET /users` | `/api/users/` | ❌ Partial | Prefix mismatch |
| `PUT /users/:id/promote` | `/api/users/:id/promote` | ❌ Partial | Prefix mismatch |
| `PUT /users/:id/ban` | `/api/users/:id/ban` | ❌ Partial | Prefix mismatch |

## Missing Endpoints (Frontend Expects)

- [ ] **GET /notifications**: Necessary for the dashboard alerts.
- [ ] **PUT /notifications/:id/read**: Marking notifications as read.
- [ ] **PUT /profile**: Updating user profile details.
- [ ] **PUT /auth/change-password**: Securely updating user passwords.

## Plan to Resolve

1. **Unify Prefix**: Adjust `AdminDashboardView.jsx` or the backend routers to ensure a consistent `/api` prefix.
2. **Implement Missing Routes**: Add the `notifications` and `profile` management endpoints to the backend.
3. **Verify Connection**: Test with a clean restart of the backend on Port 8000.
