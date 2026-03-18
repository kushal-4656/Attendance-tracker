from sqlalchemy  import Column, Integer, String, Date, ForeignKey
from database import Base

class user(Base):
    __tablename__="users" 
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(100), nullable=False)
    username=Column(String(50), unique=True, nullable=False)
    password=Column(String(255), nullable=False)
    
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department = Column(String(50), nullable=False)
    class_name = Column(String(50), nullable=False)
    total_strength = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    present_count = Column(Integer, nullable=False)

