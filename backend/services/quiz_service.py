from datetime import datetime

from ai_engine.adaptive_engine import AdaptiveEngine
from models import Question, Quiz, UserResponse, db

adaptive_engine = AdaptiveEngine()


def serialize_question(question):
    return {
        "id": question.id,
        "question_text": question.question_text,
        "question_type": question.question_type,
        "options": question.options or [],
        "difficulty": question.difficulty,
        "explanation": question.explanation,
    }


def select_next_question(quiz):
    asked_ids = set(quiz.asked_question_ids or [])
    if len(asked_ids) >= (quiz.max_questions or 10):
        return None

    candidates = (
        Question.query.filter_by(content_id=quiz.content_id, is_active=True, difficulty=quiz.current_difficulty)
        .order_by(Question.id.asc())
        .all()
    )
    for question in candidates:
        if question.id not in asked_ids:
            return question

    fallback = Question.query.filter_by(content_id=quiz.content_id, is_active=True).order_by(Question.id.asc()).all()
    for question in fallback:
        if question.id not in asked_ids:
            return question
    return None


def record_answer(quiz, question, answer, response_time):
    correct = (answer or "").strip().lower() == (question.answer or "").strip().lower()
    response = UserResponse(
        quiz_id=quiz.id,
        question_id=question.id,
        user_answer=answer,
        is_correct=correct,
        response_time=response_time or 0,
        difficulty_at_time=quiz.current_difficulty,
    )
    db.session.add(response)

    asked = quiz.asked_question_ids or []
    quiz.asked_question_ids = asked + [question.id]

    stats = adaptive_engine.summarize_performance(quiz.responses + [response])
    quiz.accuracy = stats["accuracy"]
    quiz.average_response_time = stats["avg_response_time"]
    quiz.score = round(quiz.accuracy * 100, 2)
    quiz.current_difficulty = adaptive_engine.adjust_difficulty(
        quiz.accuracy, quiz.current_difficulty
    )

    next_question = select_next_question(quiz)
    if not next_question or len(quiz.asked_question_ids or []) >= (quiz.max_questions or 10):
        quiz.status = "completed"
        quiz.completed_at = datetime.utcnow()
        next_question = None

    db.session.commit()
    return response, next_question
