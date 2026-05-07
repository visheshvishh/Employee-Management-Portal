from pydantic import BaseModel


class AdminRegister(BaseModel):
    username: str
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str


class EmployeeCreate(BaseModel):
    username: str
    email: str
    password: str
    name: str
    salary: int
    role: str = "Employee"


class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_to: int


class TaskStatusUpdate(BaseModel):
    status: str