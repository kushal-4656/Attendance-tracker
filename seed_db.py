import database
import models

def seed():
    session = database.SessionLocal()
    try:
        # Check if departments exist
        if session.query(models.department).count() == 0:
            print("Seeding departments...")
            depts = [
                models.department(name="Computer Science and Engineering (CSE)"),
                models.department(name="Information Technology (IT)"),
                models.department(name="Electronics and Communication Engineering (ECE)"),
                models.department(name="Mechanical Engineering (ME)"),
                models.department(name="Civil Engineering (CE)")
            ]
            session.add_all(depts)
            session.commit()
            print("Departments seeded successfully.")
        else:
            print("Departments already exist.")

        # Check if classes exist
        if session.query(models.Class).count() == 0:
            print("Seeding classes...")
            # Retrieve the created departments to map IDs
            cse = session.query(models.department).filter(models.department.name.like("%CSE%")).first()
            it = session.query(models.department).filter(models.department.name.like("%IT%")).first()
            ece = session.query(models.department).filter(models.department.name.like("%ECE%")).first()
            me = session.query(models.department).filter(models.department.name.like("%ME%")).first()
            ce = session.query(models.department).filter(models.department.name.like("%CE%")).first()

            classes = []
            if cse:
                classes.extend([
                    models.Class(name="CSE-A", department_id=cse.id),
                    models.Class(name="CSE-B", department_id=cse.id),
                    models.Class(name="CSE-C", department_id=cse.id),
                ])
            if it:
                classes.extend([
                    models.Class(name="IT-A", department_id=it.id),
                    models.Class(name="IT-B", department_id=it.id),
                ])
            if ece:
                classes.extend([
                    models.Class(name="ECE-A", department_id=ece.id),
                    models.Class(name="ECE-B", department_id=ece.id),
                ])
            if me:
                classes.extend([
                    models.Class(name="ME-A", department_id=me.id),
                ])
            if ce:
                classes.extend([
                    models.Class(name="CE-A", department_id=ce.id),
                ])

            session.add_all(classes)
            session.commit()
            print("Classes seeded successfully.")
        else:
            print("Classes already exist.")

        # Check if users exist
        if session.query(models.user).count() == 0:
            print("Seeding default faculty users...")
            from auth import hash_password
            cse = session.query(models.department).filter(models.department.name.like("%CSE%")).first()
            if cse:
                hashed_pwd = hash_password("Medicaps@123")
                default_user = models.user(
                    name="Default Teacher",
                    email="teacher@medicaps.ac.in",
                    password=hashed_pwd,
                    department_id=cse.id,
                    mobile="9876543210"
                )
                session.add(default_user)
                session.commit()
                print("Default teacher (teacher@medicaps.ac.in / Medicaps@123) seeded successfully.")
        else:
            print("Users already exist.")
            
    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed()
