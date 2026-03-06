from flask import Blueprint, jsonify
from sqlalchemy import func

from models import Question, Quiz, User, UserResponse, db
from utils.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.get("/users")
@admin_required
def users():
    return jsonify({"users": [user.to_dict() for user in User.query.order_by(User.id.desc()).all()]})


@admin_bp.get("/questions")
@admin_required
def questions():
    return jsonify({"questions": [question.to_dict() for question in Question.query.order_by(Question.id.desc()).all()]})


@admin_bp.delete("/question/<int:question_id>")
@admin_required
def delete_question(question_id):
    question = Question.query.get_or_404(question_id)
    question.is_active = False
    db.session.commit()
    return jsonify({"message": "Question archived"})


@admin_bp.get("/analytics")
@admin_required
def analytics():
    total_users = User.query.count()
    total_quizzes = Quiz.query.count()
    completed_quizzes = Quiz.query.filter_by(status="completed").count()
    avg_accuracy = db.session.query(func.avg(Quiz.accuracy)).scalar() or 0
    avg_response_time = db.session.query(func.avg(UserResponse.response_time)).scalar() or 0

    difficulty_breakdown = (
        db.session.query(Quiz.current_difficulty, func.count(Quiz.id))
        .group_by(Quiz.current_difficulty)
        .all()
    )

    return jsonify(
        {
            "totals": {
                "users": total_users,
                "quizzes": total_quizzes,
                "completed_quizzes": completed_quizzes,
                "average_accuracy": round(avg_accuracy * 100, 2),
                "average_response_time": round(avg_response_time, 2),
            },
            "difficulty_breakdown": [
                {"difficulty": difficulty, "count": count}
                for difficulty, count in difficulty_breakdown
            ],
        }
    )
