# Online/Offline Status Tracking - Integration Guide

## ✅ What's Been Implemented

### Backend Changes

1. **Database Models Updated**
   - `Student` model: Added `isOnline` (Boolean) and `lastActivity` (Date) fields
   - `Teacher` model: Added `isOnline` (Boolean) and `lastActivity` (Date) fields

2. **Authentication Routes Enhanced**
   - **Student Login** (`/api/students/auth/login`): Automatically sets `isOnline = true` on successful login
   - **Teacher Login** (`/api/teachers/auth/login`): Automatically sets `isOnline = true` on successful login
   - **Student Logout** (`/api/students/auth/logout`): Sets `isOnline = false`
   - **Teacher Logout** (`/api/teachers/auth/logout`): Sets `isOnline = false`
   - **Student Activity** (`/api/students/auth/activity`): Updates `lastActivity` timestamp
   - **Teacher Activity** (`/api/teachers/auth/activity`): Updates `lastActivity` timestamp

3. **Admin Routes**
   - **Get All Users** (`/api/admin/users`): Returns online status based on `isOnline` AND recent activity (within 30 minutes)
   - **Auto-Cleanup** (`/api/admin/users/cleanup-inactive`): Marks users as offline if inactive for 30+ minutes

### Frontend Changes

1. **Activity Tracker Utility** (`client/src/utils/activityTracker.js`)
   - Singleton service that tracks user activity
   - Automatically updates server every 5 minutes
   - Detects user inactivity (25 minutes)
   - Handles logout on:
     - Manual logout
     - Session timeout
     - Page/tab close
     - Browser close

2. **React Hook** (`client/src/utils/useActivityTracker.js`)
   - Easy-to-use hook for React components
   - Automatically starts/stops tracking based on authentication

## 🎯 How to Integrate into Dashboards

### For Teacher/Instructor Dashboards

Add to any instructor dashboard component (e.g., `InstructorDashboard2.jsx`):

```javascript
import { useActivityTracker } from '../utils/useActivityTracker';

export default function InstructorDashboard2() {
  // ... existing code ...
  
  // Add activity tracking
  const { logout: activityLogout } = useActivityTracker('teacher', true);
  
  // Update existing logout handler
  const handleLogout = async () => {
    // Call activity tracker logout (marks user offline)
    await activityLogout(false); // false = don't navigate yet
    
    // Original logout code
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login", { replace: true });
  };
  
  // ... rest of component ...
}
```

### For Student Dashboards

Add to any student dashboard component (e.g., `StudentDashboard2.jsx`):

```javascript
import { useActivityTracker } from '../utils/useActivityTracker';

export default function StudentDashboard2() {
  // ... existing code ...
  
  // Add activity tracking
  const { logout: activityLogout } = useActivityTracker('student', true);
  
  // Update existing logout handler
  const handleLogout = async () => {
    // Call activity tracker logout (marks user offline)
    await activityLogout(false); // false = don't navigate yet
    
    // Original logout code
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };
  
  // ... rest of component ...
}
```

## 📊 How It Works

### Flow Diagram

```
User Logs In
     ↓
Server sets isOnline = true, lastActivity = now
     ↓
Client starts Activity Tracker
     ↓
Every 5 minutes: Client→Server (update activity)
     ↓
User interaction (click/key/scroll) → Reset inactivity timer
     ↓
25 minutes of no activity → Auto logout
     ↓
Manual logout / Tab close → Server sets isOnline = false
```

### Session Timeout

- **Client-side**: 25 minutes of inactivity → Auto logout
- **Server-side**: 30 minutes since last activity → Marked offline
- Admin panel automatically shows accurate online status

### Admin Panel

The admin Users page now shows:
- ✅ Real-time online status (green dot)
- ❌ Offline status (no dot)
- Auto-refresh every 30 seconds

## 🔄 Automatic Cleanup

The system handles edge cases:
- User closes browser without logout → Status updated on next admin refresh
- User loses internet → Status updated after 30 minutes
- Server restart → Existing sessions continue working

## 🚀 To Complete Integration

You need to add the `useActivityTracker` hook to these components:

**Student Pages:**
- ✅ `StudentDashboard2.jsx`
- ✅ `PersonalizedPath.jsx`
- ✅ `AchievementPage.jsx`
- ✅ `courses.jsx`

**Instructor Pages:**
- ✅ `InstructorDashboard2.jsx`
- ✅ `TeachingCenter2.jsx`
- ✅ `InstructorCommunity2.jsx`
- ✅ `InstructorUpload2.jsx`
- ✅ `AIQuiz2.jsx`
- ✅ `Profile2.jsx`
- ✅ `GetSupport2.jsx`
- ✅ `HelpAndSupport2.jsx`

## 📝 Notes

- The activity tracker is a singleton, so only one instance runs per session
- It automatically handles page navigation within the app
- No database migrations needed - new fields have defaults
- Existing users will show offline until they log in again

