# 🏢 Employee Management Portal

A full-stack **Employee Management System** built with FastAPI, React, Tailwind CSS, and MySQL.
Admins can manage employees, assign tasks, and track progress. Employees can view their salary and manage their tasks.

---

## 🚀 Features

- 🔐 Admin Sign Up / Sign In (Email + Password)
- 👤 Employee Sign In (credentials created by Admin)
- 👨‍💼 Admin creates employee accounts with username, email, password, role & salary
- 📋 Admin assigns tasks to employees
- ✅ Employee views tasks and marks them as done
- 🔥 Admin can fire (delete) employees
- 📊 Role-based dashboards (Admin & Employee views)
- 🔒 JWT Authentication with 8-hour token expiry
- 📧 Email validation on all forms
- ⚠️ Login lockout after 3 failed attempts

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| React Router v6 | Page navigation |
| Axios | API calls to backend |
| jwt-decode | Decode JWT token for role |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy | ORM for database models |
| PyMySQL | MySQL database driver |
| Passlib + Bcrypt | Password hashing |
| Python-Jose | JWT token creation & verification |
| Uvicorn | ASGI server |

### Database
| Technology | Purpose |
|---|---|
| MySQL | Main database |
| MySQL Workbench | GUI to view/manage data |

---

## 📁 Project Structure

```
Employee-Management-Portal/
│
├── README.md
├── .gitignore
│
├── backend/                        ← FastAPI Backend
│   ├── venv/                       ← Python virtual environment
│   ├── main.py                     ← All API routes & logic
│   ├── database.py                 ← MySQL connection setup
│   ├── models.py                   ← Database table definitions
│   ├── schemas.py                  ← Request/response data schemas
│   ├── auth.py                     ← JWT tokens & password hashing
│   └── requirements.txt            ← Python dependencies
│
└── frontend/                       ← React Frontend
    ├── public/
    │   └── index.html              ← HTML entry point
    ├── package.json                ← Node dependencies
    ├── tailwind.config.js          ← Tailwind CSS config
    └── src/
        ├── index.js                ← React entry point
        ├── index.css               ← Tailwind CSS imports
        ├── App.js                  ← Root component, routing & auth state
        ├── api.js                  ← Axios instance with base URL & token
        ├── components/
        │   ├── Layout.jsx          ← Page wrapper with sidebar
        │   └── Sidebar.jsx         ← Navigation sidebar (role-based menu)
        └── pages/
            ├── Landing.jsx         ← Welcome page with Admin/Employee buttons
            ├── Login.jsx           ← Sign In & Sign Up forms
            ├── Dashboard.jsx       ← Admin stats OR Employee salary/tasks view
            ├── Employees.jsx       ← Admin: list all employees + Fire button
            ├── AddEmployee.jsx     ← Admin: create new employee account
            ├── Tasks.jsx           ← Admin: assign tasks to employees
            └── MyTasks.jsx         ← Employee: view & mark tasks as done
```

---

## 🔍 File Logic & Responsibilities

### Backend

| File | What it does |
|---|---|
| `database.py` | Creates MySQL engine, session and Base using SQLAlchemy. All DB connections start here. |
| `models.py` | Defines 3 tables: `users` (login accounts), `employees` (name, salary, position), `tasks` (title, description, status, assigned_to) |
| `schemas.py` | Pydantic models for validating incoming request data — `AdminRegister`, `Login`, `EmployeeCreate`, `TaskCreate`, `TaskStatusUpdate` |
| `auth.py` | `hash_password()` hashes passwords with bcrypt. `create_token()` creates JWT. `get_current_user()` and `require_admin()` protect routes. |
| `main.py` | All API endpoints: admin register, login, create employee, fire employee, assign task, delete task, employee profile, employee tasks, mark task done |

### Frontend

| File | What it does |
|---|---|
| `App.js` | Controls which page shows: Landing → Login → Dashboard. Stores role from JWT token. Handles logout. |
| `api.js` | Axios instance pointing to `http://127.0.0.1:8000`. Automatically attaches JWT token to every request. |
| `Landing.jsx` | First page user sees. Has Admin button and Employee button to choose login type. |
| `Login.jsx` | Admin gets Sign In + Sign Up tabs. Employee gets Sign In only. Uses email + password. Tracks failed attempts and locks after 3. |
| `Sidebar.jsx` | Shows different menu items based on role. Admin sees Dashboard, Employees, Add Employee, Assign Tasks. Employee sees Dashboard and My Tasks. |
| `Layout.jsx` | Wraps all pages with Sidebar. Passes logout and role props. |
| `Dashboard.jsx` | Admin sees total employees, salary stats, pending/done tasks. Employee sees their salary, pending tasks, completed tasks. |
| `Employees.jsx` | Admin views all employees in a table with name, username, email, position, salary. Has 🔥 Fire button with confirmation popup. |
| `AddEmployee.jsx` | Admin fills in name, username, email, password, role (dropdown), salary to create a new employee account. |
| `Tasks.jsx` | Admin selects an employee from dropdown, adds task title and description, submits. Shows all tasks with status and delete button. |
| `MyTasks.jsx` | Employee sees their assigned tasks split into Pending and Completed. Can click "Mark Done" to update status. |

---

## 🗄️ Database Schema

### `users` table
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(120) | Unique email |
| password | VARCHAR(255) | Bcrypt hashed password |
| role | VARCHAR(20) | `admin` or `employee` |

### `employees` table
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| name | VARCHAR(100) | Full name |
| position | VARCHAR(100) | Job role/title |
| salary | INT | Monthly salary |
| user_id | INT | FK → users.id |

### `tasks` table
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| title | VARCHAR(200) | Task title |
| description | TEXT | Task details |
| status | VARCHAR(20) | `pending` or `done` |
| assigned_to | INT | FK → users.id |
| created_at | DATETIME | Auto timestamp |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/register` | None | Admin sign up |
| POST | `/login` | None | Login for admin & employee |
| POST | `/admin/create_employee` | Admin | Create employee account |
| GET | `/admin/employees` | Admin | Get all employees |
| DELETE | `/admin/employees/{id}` | Admin | Fire employee |
| POST | `/admin/tasks` | Admin | Assign task to employee |
| GET | `/admin/tasks` | Admin | Get all tasks |
| DELETE | `/admin/tasks/{id}` | Admin | Delete task |
| GET | `/my/profile` | Employee | Get own profile & salary |
| GET | `/my/tasks` | Employee | Get own tasks |
| PATCH | `/my/tasks/{id}` | Employee | Mark task as done |

---

## ⚙️ Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server
- MySQL Workbench

### Step 1 — MySQL Database Setup
Open **MySQL Workbench** and run:
```sql
CREATE DATABASE emp_portal;
```

### Step 2 — Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`
API docs at: `http://127.0.0.1:8000/docs`

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`

### Step 4 — Every time after PC restart
```bash
# Terminal 1 — Backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm start
```

---

## 👤 How to Use

1. Open `http://localhost:3000`
2. Click **Admin** → **Sign Up** tab → Create admin account
3. Sign in as Admin → Go to **Add Employee** → Create employee accounts
4. Go to **Assign Tasks** → Assign tasks to employees
5. Share employee credentials with them
6. Employee opens `http://localhost:3000` → clicks **Employee** → Signs in with their email & password
7. Employee sees their salary on Dashboard and tasks in **My Tasks**
8. Employee clicks **Mark Done** when task is completed

> ⚠️ Only **one admin** account is allowed per system.

---

## 📦 Backend Dependencies

```
fastapi
uvicorn
sqlalchemy
pymysql
passlib[bcrypt]
python-jose
```

---

## 📝 License

MIT License — free to use for learning and projects.