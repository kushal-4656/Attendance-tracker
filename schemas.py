from pydantic import BaseModel
from datetime import date

class register(BaseModel):
    name:str
    email:str
    department_id:int
    mobile:str

class login(BaseModel):
    email:str
    password:str


class attendence(BaseModel):
    class_id:int
    total_strength:int
    date:date
    present_count:int

class forgot_password(BaseModel):
    email:str
    newPassword:str
    confirmNewPassword:str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str
    confirm_password:str