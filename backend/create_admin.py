from app.core.security import get_password_hash
from app.database.connection import users_collection
from datetime import datetime

def create_admin():
    print("--- Create Admin Account ---")
    name = input("Enter Admin Name: ").strip()
    email = input("Enter Admin Email: ").strip()
    password = input("Enter Admin Password: ").strip()

    if not name or not email or not password:
        print("All fields are required. Please try again.")
        return

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        if existing_user.get("role") == "ADMIN":
            print("An admin with this email already exists.")
        else:
            print("A standard user with this email already exists.")
            upgrade = input("Do you want to upgrade them to ADMIN? (y/n): ").strip().lower()
            if upgrade == 'y':
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"role": "ADMIN", "plan": "PRO PLUS", "updated_at": datetime.utcnow()}}
                )
                print("User upgraded to ADMIN successfully!")
        return

    new_user = {
        "email": email,
        "name": name,
        "hashed_password": get_password_hash(password),
        "role": "ADMIN",
        "plan": "PRO PLUS",  # Give admin the highest plan
        "theme_preference": "dark",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    users_collection.insert_one(new_user)
    print(f"Admin account for {email} created successfully!")

if __name__ == "__main__":
    create_admin()
