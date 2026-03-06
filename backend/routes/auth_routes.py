from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required

from models import User, db
from services.auth_service import check_password, hash_password, resolve_role
from utils.auth import current_user

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["name", "email", "password"]
    if not all(data.get(field) for field in required):
        return jsonify({"message": "Name, email, and password are required"}), 400

    email = data["email"].lower()
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 409

    user = User(
        name=data["name"],
        email=email,
        password_hash=hash_password(data["password"]),
        role=resolve_role(email),
        subject_preferences=data.get("subject_preferences", []),
        difficulty_preference=data.get("difficulty_preference", "Medium"),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/profile")
@jwt_required()
def get_profile():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict())


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user = current_user()
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}
    user.name = data.get("name", user.name)
    user.subject_preferences = data.get(
        "subject_preferences", user.subject_preferences or []
    )
    user.difficulty_preference = data.get(
        "difficulty_preference", user.difficulty_preference
    )

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()})
