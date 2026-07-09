from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select

from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"message": "ყველა ველი სავალდებულოა"}), 400

    if data.get('role') not in ('organizer', 'attendee'):
        data['role'] = 'attendee'

    user_exists = db.session.execute(
        select(User).where(
            (User.username == data['username']) |
            (User.email == data['email'])
        )
    ).scalar_one_or_none()

    if user_exists:
        return jsonify({"message": "მომხმარებელი უკვე არსებობს"}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "მომხმარებელი წარმატებით დარეგისტრირდა"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "გთხოვთ შეიყვანოთ ელ-ფოსტა და პაროლი"}), 400

    user = db.session.execute(
        select(User).where(User.email == data['email'])
    ).scalar_one_or_none()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"message": "არასწორი ელ-ფოსტა ან პაროლი"}), 401

    access_token = create_access_token(
        identity=str(user.id),  
        additional_claims={"role": user.role}
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()

    user = db.session.get(User, int(current_user_id))

    if not user:
        return jsonify({"message": "მომხმარებელი ვერ მოიძებნა"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }), 200
