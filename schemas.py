from pydantic import BaseModel
from datetime import date

class register(BaseModel):
    name:str
    username:str
    password            :str

class login(BaseModel):
    username:str
    password:str


class attendence(BaseModel):
    department:str
    class_name:str
    total_strength:int
    date:date
    present_count:int

class forgot_password(BaseModel):
    username:str
    newPassword:str
    confirmNewPassword:str