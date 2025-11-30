from flask_sqlalchemy import SQLAlchemy

# Shared extension instances (avoid circular imports by importing this module)
db = SQLAlchemy()
