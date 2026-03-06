from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .content import Content  # noqa: E402,F401
from .feedback import Feedback  # noqa: E402,F401
from .question import Question  # noqa: E402,F401
from .quiz import Quiz  # noqa: E402,F401
from .user import User  # noqa: E402,F401
from .user_response import UserResponse  # noqa: E402,F401
