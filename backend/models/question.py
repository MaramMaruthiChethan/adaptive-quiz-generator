from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON

from . import db


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey("content.id"), nullable=False)
    question_type = db.Column(db.String(30), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(JSON, nullable=False, default=list)
    answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(20), nullable=False, default="Medium")
    chunk_index = db.Column(db.Integer, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    responses = db.relationship(
        "UserResponse", backref="question", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "content_id": self.content_id,
            "question_type": self.question_type,
            "question_text": self.question_text,
            "options": self.options or [],
            "answer": self.answer,
            "explanation": self.explanation,
            "difficulty": self.difficulty,
            "chunk_index": self.chunk_index,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }
