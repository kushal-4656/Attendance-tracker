import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

load_dotenv()
conf=ConnectionConfig(MAIL_USERNAME=os.getenv("app_mail"), MAIL_PASSWORD=os.getenv("app_password"), MAIL_FROM=os.getenv("app_mail"), MAIL_PORT=587, MAIL_SERVER="smtp.gmail.com", MAIL_STARTTLS=True, MAIL_SSL_TLS=False, USE_CREDENTIALS=True)

async def send_email_async(to_email, username, password, name):
    message=MessageSchema(subject="Registration confirmation", recipients=[to_email], body=f"""
    Hello {name},

Your faculty account has been created.

Username: {username}
Temporary Password: {password}

Please login and change your password.

- Attendance Tracker                      
    """, subtype="plain")
    fm=FastMail(conf)
    await fm.send_message(message)

def send_email(to_email, username, password):
    import asyncio
    asyncio.run(send_email_async(to_email, username, password))
