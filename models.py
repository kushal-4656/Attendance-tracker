from sqlalchemy  import Column, Integer, String, Date, ForeignKey
from database import Base

class user(Base):
    __tablename__="users" 
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(100), nullable=False)
    email=Column(String(50), unique=True, nullable=False)
    password=Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    mobile=Column(String(15), nullable=False)
class attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))  
    class_id = Column(Integer, ForeignKey("classes.id"))
    total_strength = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    present_count = Column(Integer, nullable=False)

class department(Base):
    __tablename__="departments"
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(50), unique=True, nullable=False)


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
