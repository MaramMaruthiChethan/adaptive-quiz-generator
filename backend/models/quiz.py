from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON

from . import db


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content_id = db.Column(db.Integer, db.ForeignKey("content.id"), nullable=False)
    current_difficulty = db.Column(db.String(20), nullable=False, default="Medium")
    status = db.Column(db.String(20), nullable=False, default="in_progress")
    score = db.Column(db.Float, nullable=False, default=0)
    accuracy = db.Column(db.Float, nullable=False, default=0)
    average_response_time = db.Column(db.Float, nullable=False, default=0)
    max_questions = db.Column(db.Integer, nullable=False, default=10)
    asked_question_ids = db.Column(JSON, nullable=False, default=list)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    content = db.relationship("Content", backref="quizzes")
    responses = db.relationship(
        "UserResponse", backref="quiz", lazy=True, cascade="all, delete-orphan"
    )
    feedback = db.relationship(
        "Feedback", backref="quiz", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_id": self.content_id,
            "current_difficulty": self.current_difficulty,
            "status": self.status,
            "score": self.score,
            "accuracy": self.accuracy,
            "average_response_time": self.average_response_time,
            "max_questions": self.max_questions,
            "asked_question_ids": self.asked_question_ids or [],
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
