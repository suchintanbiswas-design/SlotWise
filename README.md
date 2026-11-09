<div align="center">

# 🏛️ SlotWise

**Campus Resource Booking Platform**

A modern, full-stack web application for discovering, reserving, and managing campus rooms, labs, and facilities — built with React, Spring Boot, and PostgreSQL.

[![CI](https://github.com/your-username/SlotWise/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/SlotWise/actions/workflows/ci.yml)
![Java](https://img.shields.io/badge/Java-21-blue?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 📋 Overview

SlotWise streamlines campus resource management for students, faculty, and administrators at VIT Chennai. Users can browse available spaces — from computer labs to auditoriums — and reserve them through a clean, intuitive interface. The backend enforces **database-level double-booking prevention** using PostgreSQL GiST exclusion constraints, guaranteeing reservation integrity even under concurrent load.

### Key Features

- **JWT Authentication** — Secure, stateless login and registration with JJWT 0.12.x and Spring Security 6.
- **Role-Based Access Control** — `STUDENT`, `FACULTY`, and `ADMIN` roles with protected routes and conditional UI rendering.
- **Real-Time Resource Discovery** — Filterable 3-column resource grid with search, type, building, and capacity filters.
- **Interactive Booking Flow** — Date strip + time slot chip selector with conflict visualization and one-click reservation.
- **Admin Approval Workflow** — Faculty and admin users can review and approve/reject bookings for restricted resources.
- **Concurrency-Safe Reservations** — PostgreSQL GiST exclusion constraint prevents double-booking at the database level.
- **Light / Dark Mode** — Fully responsive theme toggle with `localStorage` persistence.
- **Dockerized Stack** — Single `docker-compose up` spins up the entire application (PostgreSQL, Spring Boot, Nginx-served React).
- **CI/CD Pipeline** — GitHub Actions workflow for automated backend tests (Testcontainers) and frontend build verification.

---

## 🛠️ Tech Stack

| Layer          | Technology                                                                 |
|----------------|---------------------------------------------------------------------------|
| **Frontend**   | React 19, TypeScript, Vite, Tailwind CSS 3, React Router 7, TanStack Query, Lucide Icons |
| **Backend**    | Java 21, Spring Boot 3.4, Spring Security 6, Spring Data JPA, JJWT 0.12  |
| **Database**   | PostgreSQL 16 with GiST exclusion constraints and Flyway migrations       |
| **Infra**      | Docker, Docker Compose, Nginx (SPA reverse proxy), GitHub Actions CI      |
| **Architecture** | Modular Monolith (auth, booking, resource, user, admin, common modules) |

---

## 📁 Project Structure

```
SlotWise/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/slotwise/
│   │   ├── auth/                     # Login, register, JWT token service
│   │   ├── booking/                  # Booking entity, service, controller
│   │   ├── resource/                 # Campus resource management
│   │   ├── user/                     # User entity and repository
│   │   ├── admin/                    # Admin approval endpoints
│   │   └── common/                   # Security config, exception handling
│   ├── src/main/resources/
│   │   ├── application.yml           # Spring configuration
│   │   └── db/migration/             # Flyway SQL migrations (V1–V3)
│   └── Dockerfile                    # Multi-stage JDK → JRE build
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── pages/                    # Login, Register, Dashboard, Resources, Bookings, AdminDashboard
│   │   ├── components/               # Layout, AdminRoute, ProtectedRoute, RoomSelector, TimeSlotSelector
│   │   ├── context/                  # AuthContext, ThemeContext
│   │   ├── hooks/                    # useBookingData (TanStack Query)
│   │   └── api/                      # Axios instance with JWT interceptor
│   ├── nginx.conf                    # SPA routing configuration
│   └── Dockerfile                    # Multi-stage Node → Nginx build
│
├── .github/workflows/ci.yml         # GitHub Actions pipeline
├── docker-compose.yml                # Full-stack orchestration
└── .env.example                      # Environment variable template
```

---

## 🚀 Local Setup

### Prerequisites

| Tool               | Version   |
|--------------------|-----------|
| **Docker Desktop** | 20.10+    |
| **Docker Compose** | v2+       |
| Git                | Any       |

> [!NOTE]
> Docker is the **only** prerequisite. You do not need Java, Node.js, or PostgreSQL installed locally — everything runs inside containers.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SlotWise.git
cd SlotWise
```

### 2. Configure Environment Variables (Optional)

Copy the example file and adjust values if needed:

```bash
cp .env.example .env
```

The default values in `docker-compose.yml` work out of the box, so this step is optional for local development.

### 3. Start the Entire Stack

```bash
docker-compose up --build -d
```

This single command will:
1. **Pull** the PostgreSQL 16 image and start the database on port `5433`.
2. **Build** the Spring Boot backend (multi-stage Maven → JRE) and start it on port `8080`.
3. **Build** the React frontend (multi-stage Node → Nginx) and serve it on port `5173`.
4. **Run Flyway migrations** automatically on backend startup (V1 → V2 → V3).

### 4. Access the Application

| Service      | URL                          |
|--------------|------------------------------|
| **Frontend** | http://localhost:5173        |
| **Backend API** | http://localhost:8080/api/v1 |
| **PostgreSQL** | `localhost:5433` (user: `slotwise`, db: `slotwise_db`) |

### 5. Create an Account

1. Open http://localhost:5173 in your browser.
2. Click **"Create an account"** on the login page.
3. Register with any email and password (minimum 6 characters).
4. You'll be redirected to the Dashboard automatically.

### 6. Stop the Stack

```bash
docker-compose down
```

To also wipe the database volume (fresh start):

```bash
docker-compose down -v
```

---

## 🔌 API Endpoints

| Method | Endpoint                        | Auth     | Description                    |
|--------|---------------------------------|----------|--------------------------------|
| POST   | `/api/v1/auth/register`         | Public   | Create a new user account      |
| POST   | `/api/v1/auth/login`            | Public   | Authenticate and receive JWT   |
| GET    | `/api/v1/resources`             | Bearer   | List all active campus resources |
| GET    | `/api/v1/bookings/me`           | Bearer   | Get current user's bookings    |
| POST   | `/api/v1/bookings`              | Bearer   | Create a new reservation       |
| POST   | `/api/v1/bookings/{id}/cancel`  | Bearer   | Cancel an existing reservation |
| GET    | `/api/v1/admin/bookings/pending`| Admin    | List pending approval requests |
| POST   | `/api/v1/admin/bookings/{id}/approve` | Admin | Approve a booking         |
| POST   | `/api/v1/admin/bookings/{id}/reject`  | Admin | Reject a booking          |

---

## 🔧 Development (Without Docker)

If you prefer running services directly on your host machine:

### Backend

```bash
cd backend

# Ensure PostgreSQL is running on localhost:5432
# Database: slotwise_db, User: slotwise, Password: slotwise_secret

./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts on http://localhost:5173 with hot module replacement.

---

## 🧪 Running Tests

### Backend (Integration Tests with Testcontainers)

```bash
cd backend
./mvnw clean verify
```

> [!IMPORTANT]
> Backend tests use **Testcontainers** and require Docker to be running. A real PostgreSQL 16 container is spun up automatically during the test lifecycle.

### Frontend (Build Verification)

```bash
cd frontend
npm run build    # TypeScript compilation + Vite production build
```

---

## ⚠️ Troubleshooting

### 500 Internal Server Error on Login / Register (`UsernameNotFoundException`)

If you encounter a **500 Internal Server Error** when trying to log in or register — especially after a database reset (`docker-compose down -v`) — the issue is almost always a **stale JWT token** stored in your browser's local storage.

**Fix:**

1. Open your browser's Developer Tools (F12).
2. Navigate to **Application** → **Local Storage** → `http://localhost:5173`.
3. Delete the `token` and `user` entries (or click **Clear All**).
4. Refresh the page and try logging in again.

> [!TIP]
> This happens because the old JWT references a user ID that no longer exists in the freshly reset database. Clearing local storage forces the app to redirect to the login page for a fresh authentication.

### Flyway Migration Version Conflict

If the backend fails to start with a Flyway error about duplicate versions, ensure your migration files are numbered sequentially:

```
V1__init_resources.sql
V2__init_users_and_bookings.sql
V3__add_more_campus_resources.sql
```

Run `docker-compose down -v && docker-compose up --build -d` to reset the database and re-apply all migrations cleanly.

### Port Conflicts

| Default Port | Service    | Override                                      |
|--------------|------------|-----------------------------------------------|
| 5433         | PostgreSQL | Change in `docker-compose.yml` under `db.ports` |
| 8080         | Backend    | Change in `docker-compose.yml` under `backend.ports` |
| 5173         | Frontend   | Change in `docker-compose.yml` under `frontend.ports` |

---

## 📸 Screenshots

> _Screenshots coming soon — run the application locally to explore the full UI including the split-screen auth pages, command-center dashboard, resource discovery grid, and bookings management table._

---

## 🗺️ Roadmap

- [ ] Email notifications for booking confirmations and approvals
- [ ] Google Calendar integration
- [ ] Resource usage analytics dashboard
- [ ] QR code check-in for reservations
- [ ] Mobile-responsive progressive web app (PWA)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ☕ and ⚛️ by <a href="https://github.com/your-username">Your Name</a></sub>
</div>
