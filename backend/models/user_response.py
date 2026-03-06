from datetime import datetime

from . import db


class UserResponse(db.Model):
    __tablename__ = "user_responses"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)
    user_answer = db.Column(db.Text, nullable=True)
    is_correct = db.Column(db.Boolean, nullable=False)
    response_time = db.Column(db.Float, nullable=False, default=0)
    difficulty_at_time = db.Column(db.String(20), nullable=False, default="Medium")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_id": self.question_id,
            "user_answer": self.user_answer,
            "is_correct": self.is_correct,
            "response_time": self.response_time,
            "difficulty_at_time": self.difficulty_at_time,
            "created_at": self.created_at.isoformat(),
        }
