# EduPulse — Intelligent Academic Learning & Performance Platform

## Module 1: Authentication & User Management

EduPulse is a centralized educational platform. This repository contains **Module 1: Authentication & User Management**, built using the MERN stack (MongoDB, Express.js, React.js, Node.js).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Routing**: React Router DOM (`v6`)
- **HTTP Client**: Axios (configured with `withCredentials: true`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-Only cookies
- **Password Hashing**: bcryptjs
- **Utilities**: `cookie-parser`, `cors`, `dotenv`

---

## 📁 Folder Structure

```
EduPulse/
│
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # UI components (Navbar, UserAvatar, etc.)
│   │   ├── context/         # AuthContext (state management & session restoration)
│   │   ├── hooks/           # Custom hooks (useAuth)
│   │   ├── layouts/         # Layout components (MainLayout)
│   │   ├── pages/           # Pages (Login, Register, Dashboard, Profile)
│   │   ├── routes/          # ProtectedRoute component
│   │   ├── services/        # Centralized Axios instance & API services
│   │   ├── utils/           # Helper constants
│   │   ├── App.jsx          # Application routing configuration
│   │   ├── index.css        # Tailwind CSS import & global styles
│   │   └── main.jsx         # App entry point with AuthProvider
│   └── package.json
│
├── backend/                 # Express Node.js Backend API
│   ├── src/
│   │   ├── config/          # Database configuration (db.js)
│   │   ├── controllers/     # Auth, User, & Test controllers
│   │   ├── middleware/      # Auth & Error middleware
│   │   ├── models/          # Mongoose User model
│   │   ├── routes/          # Auth, User, & Test API routes
│   │   ├── services/        # Auth & User business logic services
│   │   ├── utils/           # JWT token generator & API response formatters
│   │   ├── app.js           # Express app setup & middleware
│   │   └── server.js        # Server entry point
│   ├── .env.example         # Template for environment variables
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory using `backend/.env.example` as a template:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edupulse
JWT_SECRET=your_super_secret_jwt_key_edupulse_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Installation & Running

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or Atlas cluster)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application runs on `http://localhost:5173`.

---

## 🔑 User Roles & Access Control

1. **STUDENT** (Default): Can access Student Dashboard, view/update profile, change password, and access `/api/student/test`.
2. **FACULTY**: Can access Faculty Dashboard, view/update profile, change password, and access `/api/faculty/test` & `/api/student/test`.
3. **ADMIN**: Full administrative access including `/api/admin/test`, `/api/faculty/test`, & `/api/student/test`.
   *Note: Public registration for ADMIN accounts is strictly blocked for security reasons.*

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register a new Student or Faculty account
- `POST /api/auth/login` - Login user and issue HTTP-only JWT cookie
- `POST /api/auth/logout` - Clear HTTP-only authentication cookie
- `GET /api/auth/me` - Fetch currently authenticated user profile (session restoration)
- `PUT /api/auth/change-password` - Change user password

### User Profile
- `GET /api/users/profile` - Retrieve user profile details
- `PUT /api/users/profile` - Update profile name, department, profile image

### Role Authorization Verification
- `GET /api/admin/test` - Protected (ADMIN only)
- `GET /api/faculty/test` - Protected (ADMIN, FACULTY)
- `GET /api/student/test` - Protected (ADMIN, FACULTY, STUDENT)

## Module 3: Assignments & Quizzes Management (Completed ✅)

- **MCQ Quiz Engine**: Timed evaluations, question builders, automatic scoring upon submission, answer obfuscation for students, and result scorecards.
- **Assignments**: Open-ended submissions with written responses, repository/attachment links, passing grade criteria, and instructor grading with feedback.
- **Endpoints**:
  - `POST /api/courses/:courseId/assessments` - Create assignment/quiz (Faculty/Admin)
  - `GET /api/courses/:courseId/assessments` - List course assessments
  - `GET /api/assessments/:assessmentId` - Assessment details (answers hidden for students)
  - `POST /api/assessments/:assessmentId/submit` - Submit quiz or assignment
  - `GET /api/assessments/:assessmentId/my-submission` - View student submission & grade
  - `GET /api/assessments/:assessmentId/submissions` - View all submissions for grading (Faculty)
  - `PUT /api/submissions/:submissionId/grade` - Grade assignment and provide feedback

---

## 🔄 Authentication Flow
1. User logs in at `/login` or registers at `/register`.
2. Backend validates credentials, hashes password with `bcryptjs`, and issues a JWT token set as an `HTTP-only` cookie (`token`).
3. Frontend uses `AuthContext` with a centralized Axios instance (`withCredentials: true`).
4. On browser reload, `AuthContext` automatically sends `GET /api/auth/me` to restore user session without requiring re-login.
5. Logging out calls `POST /api/auth/logout` which clears the cookie and resets frontend context state.

---

## 🔮 Future Modules (Designed for Compatibility)
EduPulse is architected so that future modules will seamlessly integrate with the `User` schema:
- Attendance Management
- Discussion Forums
- Performance Analytics & Academic Intelligence
