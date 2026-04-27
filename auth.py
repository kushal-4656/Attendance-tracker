from passlib.context import CryptContext
import re

pwd_context=CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def varify_password(plain_password:str, hash_password:str):
    return pwd_context.verify(plain_password,hash_password)



def validate_password(password: str):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$'
    
    if not re.match(pattern, password):
        return False, "Password must be at least 8 characters long and include uppercase, lowercase, digit, and any special symbol"
    
    return True, "Password matched"