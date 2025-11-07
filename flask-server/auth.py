from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

# Create a Blueprint for auth-related routes
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Missing username or password'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400

        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, password_hash=hashed_pw)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User registered successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Missing username or password'}), 400

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            return jsonify({'message': 'Login successful'})
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500
