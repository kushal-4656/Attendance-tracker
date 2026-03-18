from passlib.context import CryptContext
import re

pwd_context=CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def varify_password(plain_password:str, hash_password:str):
    return pwd_context.verify(plain_password,hash_password)

def validate_password(password:str):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$'
    if not re.match(pattern,password):
        return False ,"Password should be 8 character long must include 1 uppercase, 1 lowercase, 1 digit and 1 special symbol"
    return True,"password matched"
