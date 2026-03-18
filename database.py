import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
load_dotenv()
userName=os.getenv("mysql_username")
passWord=os.getenv("mysql_pwd")
host= os.getenv("mysql_host")
db_name= "attendence_management"

database_url= f"mysql+pymysql://{userName}:{passWord}@{host}/{db_name}"

engine = create_engine(database_url)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

