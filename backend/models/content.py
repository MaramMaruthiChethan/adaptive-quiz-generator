from datetime import datetime

from sqlalchemy.dialects.postgresql import JSON

from . import db


class Content(db.Model):
    __tablename__ = "content"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    source_type = db.Column(db.String(20), nullable=False)
    source_value = db.Column(db.Text, nullable=True)
    raw_text = db.Column(db.Text, nullable=False)
    cleaned_text = db.Column(db.Text, nullable=False)
    chunks = db.Column(JSON, nullable=False, default=list)
    keywords = db.Column(JSON, nullable=False, default=list)
    concepts = db.Column(JSON, nullable=False, default=list)
    content_metadata = db.Column("metadata", JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    questions = db.relationship(
        "Question", backref="content", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "source_type": self.source_type,
            "source_value": self.source_value,
            "keywords": self.keywords or [],
            "concepts": self.concepts or [],
            "chunks": self.chunks or [],
            "metadata": self.content_metadata or {},
            "created_at": self.created_at.isoformat(),
        }
