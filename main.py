from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import models, schemas
from auth import hash_password, varify_password, validate_password
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register")
def register(user:schemas.register, db:Session=Depends(get_db)):
    is_valid, message=validate_password(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    exist_user=db.query(models.user).filter(models.user.username==user.username).first()
    if exist_user:
        raise HTTPException(status_code=400, detail="User name already exist")
    hash_pwd=hash_password(user.password)

    new_user=models.user(name=user.name, username=user.username, password=hash_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message":"registered successfully"}

@app.post("/login")
def login(user:schemas.login, db:Session=Depends(get_db)):
    db_user=db.query(models.user).filter(models.user.username==user.username).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="invalid username")
    if not varify_password(user.password,db_user.password):
        raise HTTPException(status_code=401, detail="invalid password")
    return {"message":"Log in successfull","faculty_id":db_user.id,"name":db_user.name}

@app.post("/attendence")
def upload_attendence(data:schemas.attendence, faculty_id:int, db:Session=Depends(get_db)):
    new_attendence=models.Attendance(faculty_id=faculty_id, department=data.department, class_name=data.class_name, total_strength=data.total_strength, date=data.date, present_count=data.present_count)
    db.add(new_attendence)
    db.commit()
    return {"message":"attendence uploaded successfully "}

@app.get("/attendence")
def get_attendence(department:str=None, date:str=None, db:Session=Depends(get_db)):
    query=db.query(models.Attendance)
    if department:
        query=query.filter(models.Attendance.department==department)
    if date:
        query=query.filter(models.Attendance.date==date)
    return query.all()


@app.post("/forgot-password")
def forgot_pwd(data:schemas.forgot_password, db:Session=Depends(get_db)):
    user=db.query(models.user).filter(models.user.username==data.username).first()
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

