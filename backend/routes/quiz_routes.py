from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Content, Question, Quiz, db
from services.quiz_service import record_answer, select_next_question, serialize_question
from utils.auth import current_user

quiz_bp = Blueprint("quiz", __name__, url_prefix="/quiz")
MIN_QUESTIONS = 5
MAX_QUESTIONS = 30


@quiz_bp.get("/start")
@jwt_required()
def start_quiz():
    user = current_user()
    content_id = request.args.get("content_id", type=int)
    requested_count = request.args.get("question_limit", default=10, type=int)
    if not content_id:
        return jsonify({"message": "content_id is required"}), 400

    if requested_count is None:
        requested_count = 10
    question_limit = max(MIN_QUESTIONS, min(MAX_QUESTIONS, requested_count))

    content = Content.query.get(content_id)
    if not content:
        return jsonify({"message": "Content not found"}), 404

    quiz = Quiz(
        user_id=user.id,
        content_id=content.id,
        current_difficulty=user.difficulty_preference or "Medium",
        max_questions=question_limit,
    )
    db.session.add(quiz)
    db.session.commit()

    question = select_next_question(quiz)
    if not question:
        return jsonify({"message": "No questions available for this content"}), 404

    return jsonify({"quiz": quiz.to_dict(), "question": serialize_question(question)})


@quiz_bp.post("/answer")
@jwt_required()
def answer_question():
    data = request.get_json() or {}
    quiz_id = data.get("quiz_id")
    question_id = data.get("question_id")
    answer = data.get("answer")
    response_time = float(data.get("response_time") or 0)

    quiz = Quiz.query.get(quiz_id)
    question = Question.query.get(question_id)
    if not quiz or not question:
        return jsonify({"message": "Quiz or question not found"}), 404

    response, next_question = record_answer(quiz, question, answer, response_time)
    payload = {
        "response": response.to_dict(),
        "quiz": quiz.to_dict(),
        "next_question": serialize_question(next_question) if next_question else None,
        "completed": quiz.status == "completed",
    }
    return jsonify(payload)


@quiz_bp.get("/next")
@jwt_required()
def next_question():
    quiz_id = request.args.get("quiz_id", type=int)
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    question = select_next_question(quiz)
    if not question:
        return jsonify({"message": "No more questions", "completed": True})
    return jsonify({"question": serialize_question(question), "completed": False})


@quiz_bp.get("/result/<int:quiz_id>")
@jwt_required()
def quiz_result(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    responses = [response.to_dict() for response in quiz.responses]
    return jsonify(
        {
            "quiz": quiz.to_dict(),
            "responses": responses,
            "summary": {
                "score": quiz.score,
                "accuracy": round(quiz.accuracy * 100, 2),
                "average_response_time": round(quiz.average_response_time, 2),
                "difficulty_level": quiz.current_difficulty,
                "total_answered": len(quiz.asked_question_ids or []),
                "question_limit": quiz.max_questions,
            },
        }
    )
