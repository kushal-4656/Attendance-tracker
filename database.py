import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")

connect_args = {}
if database_url and "mysql" in database_url:
    # PyMySQL does not support ssl-mode query parameters. Strip it if present.
    if "ssl-mode=" in database_url or "ssl_mode=" in database_url:
        database_url = database_url.split("?")[0]
    # Configure SSL for secure connections (e.g. Aiven MySQL)
    connect_args["ssl"] = {}

engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


