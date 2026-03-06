from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON

from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="learner")
    subject_preferences = db.Column(JSON, nullable=False, default=list)
    difficulty_preference = db.Column(db.String(20), nullable=False, default="Medium")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    quizzes = db.relationship("Quiz", backref="user", lazy=True, cascade="all, delete")
    contents = db.relationship(
        "Content", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "subject_preferences": self.subject_preferences or [],
            "difficulty_preference": self.difficulty_preference,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
