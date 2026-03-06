from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from models import User


def current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id)) if user_id else None


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user()
        if not user or user.role != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper
