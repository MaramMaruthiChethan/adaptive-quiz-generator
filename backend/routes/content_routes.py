from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models import Content, Question, db
from services.content_service import parse_pdf, parse_url, process_text
from utils.auth import current_user

content_bp = Blueprint("content", __name__, url_prefix="/content")


def _save_content_record(user_id, title, source_type, source_value, raw_text):
    analysis, questions = process_text(raw_text)
    content = Content(
        user_id=user_id,
        title=title,
        source_type=source_type,
        source_value=source_value,
        raw_text=raw_text,
        cleaned_text=analysis["cleaned_text"],
        chunks=analysis["chunks"],
        keywords=analysis["keywords"],
        concepts=analysis["concepts"],
        content_metadata={"sentence_count": len(analysis["sentences"])},
    )
    db.session.add(content)
    db.session.flush()

    for question in questions:
        db.session.add(
            Question(
                content_id=content.id,
                question_type=question["question_type"],
                question_text=question["question"],
                options=question["options"],
                answer=question["answer"],
                explanation=question["explanation"],
                difficulty=question["difficulty"],
                chunk_index=question["chunk_index"],
            )
        )

    db.session.commit()
    return content


@content_bp.post("/upload")
@jwt_required()
def upload_pdf():
    user = current_user()
    file = request.files.get("file")
    if not file:
        return jsonify({"message": "PDF file is required"}), 400
    if not (file.filename or "").lower().endswith(".pdf"):
        return jsonify({"message": "Please upload a valid PDF file"}), 400

    try:
        raw_text = parse_pdf(file)
        title = request.form.get("title") or file.filename or "Uploaded PDF"
        content = _save_content_record(user.id, title, "pdf", file.filename, raw_text)
        return jsonify({"message": "Content processed", "content": content.to_dict()}), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception:
        return jsonify({"message": "PDF processing failed. Try another file or use raw text mode."}), 500


@content_bp.post("/url")
@jwt_required()
def upload_url():
    user = current_user()
    data = request.get_json() or {}
    url = data.get("url")
    if not url:
        return jsonify({"message": "URL is required"}), 400

    try:
        title, raw_text = parse_url(url)
        content = _save_content_record(user.id, title, "url", url, raw_text)
        return jsonify({"message": "URL processed", "content": content.to_dict()}), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception:
        return jsonify({"message": "URL processing failed. Check the page or try raw text mode."}), 500


@content_bp.post("/text")
@jwt_required()
def upload_text():
    user = current_user()
    data = request.get_json() or {}
    raw_text = data.get("text")
    title = data.get("title") or "Text Submission"
    if not raw_text:
        return jsonify({"message": "Text is required"}), 400

    try:
        content = _save_content_record(user.id, title, "text", None, raw_text)
        return jsonify({"message": "Text processed", "content": content.to_dict()}), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception:
        return jsonify({"message": "Text processing failed"}), 500


@content_bp.get("")
@jwt_required()
def list_content():
    user = current_user()
    contents = (
        Content.query.filter_by(user_id=user.id)
        .order_by(Content.id.desc())
        .all()
    )
    return jsonify({"content": [item.to_dict() for item in contents]})
