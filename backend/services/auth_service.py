from flask_bcrypt import Bcrypt

from config import Config

bcrypt = Bcrypt()


def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")


def check_password(password_hash, password):
    return bcrypt.check_password_hash(password_hash, password)


def resolve_role(email):
    return "admin" if email.lower() in Config.ADMIN_EMAILS else "learner"
