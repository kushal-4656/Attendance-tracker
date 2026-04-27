import os
from dotenv import load_dotenv
from pydantic import BaseModel
import re
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, APIRouter, Header
from mail import send_email
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy.orm import Session
from  datetime import date, timedelta
from database import SessionLocal, Base, engine
import models, schemas
from auth import hash_password, varify_password, validate_password
from password_generator import generate_password
load_dotenv()
admin_secret=os.getenv("admin_secret")
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
pattern = r'^[a-zA-Z0-9._%+-]+@medicaps\.ac\.in$'
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register")
def register(background_tasks:BackgroundTasks, user:schemas.register, db:Session=Depends(get_db), secret:str=Header(...)):
    if secret!=admin_secret:
        raise HTTPException(status_code=403, detail="Not allowed")
        
    if not re.match(pattern,user.email):
        raise HTTPException(status_code=400, detail="Invalid Medicaps email")
    exist_user=db.query(models.user).filter(models.user.email==user.email).first()
    if exist_user:
        raise HTTPException(status_code=400, detail="email already exist")
    plain_password=generate_password()
    hash_pwd=hash_password(plain_password)
    new_user=models.user(name=user.name, email=user.email, password=hash_pwd, department_id=user.department_id, mobile=user.mobile)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    background_tasks.add_task(send_email, user.email, user.name, plain_password)
    return {"message":"registered successfully"}

@app.post("/login")
def login(user:schemas.login, db:Session=Depends(get_db)):
    db_user=db.query(models.user).filter(models.user.email==user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="invalid email")
    if not varify_password(user.password,db_user.password):
        raise HTTPException(status_code=401, detail="invalid password")
    return {"message":"Log in successfull","faculty_id":db_user.id,"name":db_user.name, "department": db_user.department_id, "email":db_user.email, "mobile":db_user.mobile}

@app.post("/attendence")
def upload_attendence(data:schemas.attendence, faculty_id:int, db:Session=Depends(get_db)):
    user = db.query(models.user).filter(models.user.id == faculty_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_attendence=models.attendance(faculty_id=faculty_id, department_id=user.department_id, class_id=data.class_id, total_strength=data.total_strength, date=data.date, present_count=data.present_count)
    db.add(new_attendence)
    db.commit()
    return {"message":"attendence uploaded successfully "}




@app.get("/attendance")
def get_attendance(
    faculty_id: int,
    date: date | None = None,
    db: Session = Depends(get_db)
):

    user = db.query(models.user).filter(models.user.id == faculty_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(models.attendance, models.department, models.Class)\
        .join(models.department, models.attendance.department_id == models.department.id)\
        .join(models.Class, models.attendance.class_id == models.Class.id)\
        .filter(models.attendance.department_id == user.department_id)

    if date:
        query = query.filter(models.attendance.date == date)

    results = query.all()

    response = []

    for att, dept, cls in results:
        response.append({
            "date": att.date,
            "department": dept.name,
            "class_name": cls.name,   # 🔥 FIXED
            "total_strength": att.total_strength,
            "present_count": att.present_count
        })

    return response
    

    
@app.post("/forgot-password")
def forgot_pwd(data:schemas.forgot_password, db:Session=Depends(get_db)):
    user=db.query(models.user).filter(models.user.email==data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.newPassword != data.confirmNewPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    is_validate, message=validate_password    (data.newPassword)
    if not is_validate:
        raise HTTPException(status_code=400, detail=message)
    hash_pwd=hash_password(data.newPassword)
    user.password=hash_pwd
    

        
    db.commit()
    return {"message":"password update successfully"}

@app.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(models.department).all()
    return departments

@app.post("/change-password")
def change_password(
    data: schemas.ChangePassword,
    faculty_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(models.user).filter(models.user.id == faculty_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Password must match")
    if not varify_password(data.old_password, user.password):
        raise HTTPException(status_code=400, detail="Old password incorrect")

    # validate new password
    is_valid, message = validate_password(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # update password
    user.password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}

@app.get("/classes/{faculty_id}")
def get_Classes(faculty_id: int, db: Session = Depends(get_db)):

    user = db.query(models.user).filter(models.user.id == faculty_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    Classes = db.query(models.Class)\
        .filter(
        models.Class.department_id == user.department_id)\
        .all()

    return Classes

@app.get("/faculty")
def get_faculty(db: Session = Depends(get_db),secret:str=Header(...)):

    if secret != admin_secret:
        raise HTTPException(status_code=403, detail="Not allowed")
    results = db.query(models.user, models.department)\
        .join(models.department, models.user.department_id == models.department.id)\
        .all()

    data = []

    for user, dept in results:
        data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "department": dept.name,
            "department_id": dept.id        # 🔥 important addition
        })
    return data

@app.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):

    user = db.query(models.user).filter(models.user.id == faculty_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "Faculty deleted successfully"}

@app.get("/faculty/{faculty_id}")
def get_single_faculty(faculty_id: int, db: Session = Depends(get_db)):

    result = db.query(models.user, models.department)\
        .join(models.department, models.user.department_id == models.department.id)\
        .filter(models.user.id == faculty_id)\
        .first()

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    user, dept = result

    return {
        "id": user.id,
        "name": user.name,
        "username": user.email,
        "mobile": user.mobile,
        "department": dept.name,
        "department_id": dept.id
    }

@app.get("/dashboard/{faculty_id}")
def get_dashboard(faculty_id: int, db: Session = Depends(get_db)):

    # 🔹 Get user
    user = db.query(models.user).filter(models.user.id == faculty_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    dept_id = user.department_id

    # 🔹 All attendance of this department
    records = db.query(models.attendance)\
        .filter(models.attendance.department_id == dept_id)\
        .all()

    # 🔹 Today
    today = date.today()

    today_records = [r for r in records if r.date == today]
    today_present = sum(r.present_count for r in today_records)

    # 🔹 Total students
    total_students = sum(r.total_strength for r in records)
    total_present = sum(r.present_count for r in records)

    avg_attendance = (total_present / total_students * 100) if total_students else 0

    # 🔹 Last 7 days
    week_ago = today - timedelta(days=7)
    week_records = [r for r in records if r.date >= week_ago]
    week_present = sum(r.present_count for r in week_records)

    # 🔹 Recent activity (last 5)
    recent = sorted(records, key=lambda x: x.date, reverse=True)[:5]

    recent_data = [
        {
            "class_id": r.class_id,
            "date": r.date,
            "present": r.present_count,
            "total": r.total_strength
        }
        for r in recent
    ]

    return {
        "today_count": today_present,
        "total_students": total_students,
        "avg_attendance": round(avg_attendance, 1),
        "week_count": week_present,
        "recent_activity": recent_data
    }