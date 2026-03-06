import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text

from config import Config
from models import db
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.content_routes import content_bp
from routes.quiz_routes import quiz_bp
from services.auth_service import bcrypt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(admin_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()
        db.session.execute(
            text(
                "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_questions INTEGER NOT NULL DEFAULT 10"
            )
        )
        db.session.commit()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
