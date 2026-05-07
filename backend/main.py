from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, schemas, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Management Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── ADMIN REGISTER ───────────────────────────────────────────
@app.post("/admin/register")
def admin_register(data: schemas.AdminRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    # Only allow one admin
    if db.query(models.User).filter(models.User.role == "admin").first():
        raise HTTPException(status_code=400, detail="Admin already exists")
    new_admin = models.User(
        username=data.username,
        email=data.email,
        password=auth.hash_password(data.password),
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    return {"msg": "Admin registered successfully"}


# ─── LOGIN (email + password for both) ────────────────────────
@app.post("/login")
def login(data: schemas.Login, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()
    if not user or not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = auth.create_token({
        "sub": user.username,
        "role": user.role,
        "user_id": user.id
    })
    return {"access_token": token, "role": user.role}


# ─── ADMIN: Create Employee ────────────────────────────────────
@app.post("/admin/create_employee")
def create_employee(
    emp: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    if db.query(models.User).filter(models.User.username == emp.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        username=emp.username,
        email=emp.email,
        password=auth.hash_password(emp.password),
        role="employee"
    )
    db.add(new_user)
    db.flush()

    new_emp = models.Employee(
        name=emp.name,
        position=emp.role,
        salary=emp.salary,
        user_id=new_user.id
    )
    db.add(new_emp)
    db.commit()
    return {"msg": "Employee created successfully"}


# ─── ADMIN: Get All Employees ──────────────────────────────────
@app.get("/admin/employees")
def get_all_employees(
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    rows = db.query(models.Employee, models.User).join(
        models.User, models.Employee.user_id == models.User.id
    ).all()
    return [
        {
            "id": emp.id,
            "user_id": usr.id,
            "name": emp.name,
            "username": usr.username,
            "email": usr.email,
            "salary": emp.salary,
            "position": emp.position,
        }
        for emp, usr in rows
    ]


# ─── ADMIN: Delete Employee ────────────────────────────────────
@app.delete("/admin/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.query(models.Task).filter(models.Task.assigned_to == emp.user_id).delete()
    usr = db.query(models.User).filter(models.User.id == emp.user_id).first()
    db.delete(emp)
    db.flush()
    if usr:
        db.delete(usr)
    db.commit()
    return {"msg": "Employee fired successfully"}


# ─── ADMIN: Create Task ────────────────────────────────────────
@app.post("/admin/tasks")
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    emp_user = db.query(models.User).filter(
        models.User.id == task.assigned_to,
        models.User.role == "employee"
    ).first()
    if not emp_user:
        raise HTTPException(status_code=404, detail="Employee not found")
    new_task = models.Task(
        title=task.title,
        description=task.description,
        assigned_to=task.assigned_to,
        status="pending"
    )
    db.add(new_task)
    db.commit()
    return {"msg": "Task assigned successfully"}


# ─── ADMIN: Get All Tasks ──────────────────────────────────────
@app.get("/admin/tasks")
def get_all_tasks(
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    rows = db.query(models.Task, models.User).join(
        models.User, models.Task.assigned_to == models.User.id
    ).all()
    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "assigned_to": task.assigned_to,
            "assigned_to_name": usr.username,
            "created_at": str(task.created_at)
        }
        for task, usr in rows
    ]


# ─── ADMIN: Delete Task ────────────────────────────────────────
@app.delete("/admin/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(auth.require_admin)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"msg": "Task deleted"}


# ─── EMPLOYEE: Get My Profile ──────────────────────────────────
@app.get("/my/profile")
def get_my_profile(
    db: Session = Depends(get_db),
    user: dict = Depends(auth.get_current_user)
):
    usr = db.query(models.User).filter(models.User.id == user["user_id"]).first()
    if not usr:
        raise HTTPException(status_code=404, detail="User not found")
    emp = db.query(models.Employee).filter(models.Employee.user_id == user["user_id"]).first()
    return {
        "username": usr.username,
        "email": usr.email,
        "name": emp.name if emp else usr.username,
        "position": emp.position if emp else "Employee",
        "salary": emp.salary if emp else 0
    }


# ─── EMPLOYEE: Get My Tasks ────────────────────────────────────
@app.get("/my/tasks")
def get_my_tasks(
    db: Session = Depends(get_db),
    user: dict = Depends(auth.get_current_user)
):
    tasks = db.query(models.Task).filter(
        models.Task.assigned_to == user["user_id"]
    ).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "created_at": str(t.created_at)
        }
        for t in tasks
    ]


# ─── EMPLOYEE: Update Task Status ─────────────────────────────
@app.patch("/my/tasks/{task_id}")
def update_task_status(
    task_id: int,
    body: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(auth.get_current_user)
):
    if body.status not in ("pending", "done"):
        raise HTTPException(status_code=400, detail="Status must be pending or done")
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.assigned_to == user["user_id"]
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = body.status
    db.commit()
    return {"msg": "Task updated"}