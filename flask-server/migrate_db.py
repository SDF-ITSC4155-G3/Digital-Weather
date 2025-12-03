"""
Database migration script to add Pin and Review tables.
Run this script to update the database with the new models.
"""
from server import app
from extensions import db

if __name__ == "__main__":
    with app.app_context():
        # Create all tables that don't exist yet
        db.create_all()
        print("Database migration completed successfully!")
        print("Pin and Review tables have been created.")
