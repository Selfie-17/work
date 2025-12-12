# MD Collab Platform

A full-stack collaborative Markdown editing platform with role-based access control, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **🔐 Role-based Access Control**
  - **Viewer**: Read-only access to approved markdown files
  - **Editor**: Create files and edit existing files (requires admin approval)
  - **Admin**: Full access - approve/reject edits, manage users and files

- **📝 Live Markdown Editor**
  - Real-time markdown preview
  - Syntax highlighting
  - Side-by-side editing

- **🔍 GitHub-style Diff Viewer**
  - See exactly what was added/removed
  - Line-by-line comparison
  - Visual highlighting for changes

- **✅ Approval Workflow**
  - Editors submit changes for review
  - Admins can approve or reject with one click
  - Changes are applied only after approval

## Project Structure

```
md-collab-platform/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
│   └── package.json
│
├── backend/                # Express + MongoDB backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Express server
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd md-collab-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Edit .env file
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/md-collab
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   This creates demo users:
   - admin@example.com (password: password123)
   - editor@example.com (password: password123)
   - viewer@example.com (password: password123)

5. **Start the backend**
   ```bash
   npm run dev
   ```

6. **Install frontend dependencies** (new terminal)
   ```bash
   cd frontend
   npm install
   ```

7. **Start the frontend**
   ```bash
   npm run dev
   ```

8. **Open the app**
   Navigate to http://localhost:3000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Files
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/files | Get all files | All |
| GET | /api/files/:id | Get single file | All |
| POST | /api/files | Create file | Editor, Admin |
| PUT | /api/files/:id | Update file | Admin |
| DELETE | /api/files/:id | Delete file | Admin |

### Edits
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/edits/my | Get my edits | Editor |
| GET | /api/edits/all | Get all edits | Admin |
| GET | /api/edits/pending | Get pending edits | Admin |
| POST | /api/edits | Submit edit | Editor |
| POST | /api/edits/:id/approve | Approve edit | Admin |
| POST | /api/edits/:id/reject | Reject edit | Admin |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | Get all users | Admin |
| PUT | /api/users/:id/role | Update user role | Admin |
| DELETE | /api/users/:id | Delete user | Admin |

## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Tailwind CSS
- React Markdown
- Lucide Icons
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## License

MIT License
