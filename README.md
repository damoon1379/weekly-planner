# Weekly Planner

A full-stack weekly planner application built with **Next.js, TypeScript, Django REST Framework, and PostgreSQL**.

The application helps users organize their weekly schedules, manage daily tasks, track actual time spent, and monitor their weekly progress.

**Live Demo:** [Weekly Planner](https://weekly-planner-wine-mu.vercel.app)

## Features

- **User Authentication:** Register and log in with username and password.
- **Weekly Calendar:** Navigate between days and select a date to view its tasks.
- **Task Management:** Create and manage reusable tasks.
- **Daily Records:** Assign tasks to specific dates and record planned time, actual time, completion status, and notes.
- **CRUD Operations:** Create, edit, and delete tasks and daily records.
- **Weekly Progress:** View planned time, actual time, completed records, and overall completion percentage.
- **Responsive Design:** Use the application on desktop and mobile devices.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- Gunicorn
- WhiteNoise

### Database & Deployment
- PostgreSQL (Supabase)
- Vercel (Frontend hosting)
- Render (Backend hosting)

## Architecture

The application uses a separate frontend and backend architecture.

```text
              User
               |
               v
       Next.js Frontend
           (Vercel)
               |
          REST API
               |
               v
       Django Backend
           (Render)
               |
               v
       PostgreSQL
          (Supabase)
```

The frontend communicates with the Django REST API using HTTP requests. Authentication is handled through JWT tokens stored in secure HTTP-only cookies, with CSRF protection for unsafe requests.

## Local Installation

### Prerequisites

- Node.js and npm
- Python
- PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/damoon1379/weekly-planner.git
cd weekly-planner
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_HOST=your-database-host
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

Apply database migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Security

- Password-based authentication.
- JWT authentication with HTTP-only cookies.
- CSRF protection for unsafe HTTP methods.
- CORS configuration for frontend-backend communication.
- Environment variables for sensitive configuration.

**Note:** Never commit `.env` files, database credentials, or production secret keys to version control.

## Future Improvements

- Performance optimization.
- Improved data visualization for weekly and monthly statistics.
- Additional scheduling and productivity features.
