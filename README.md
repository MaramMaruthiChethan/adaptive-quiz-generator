# Adaptive Quiz & Question Generator

Adaptive Quiz & Question Generator is a full-stack local-first project that ingests educational content, processes it with NLP, generates quizzes automatically, adapts question difficulty based on learner performance, and exposes analytics through an admin dashboard.

## Stack

- Frontend: React, Vite, TailwindCSS, shadcn-style UI primitives, React Router, Axios, Framer Motion, Recharts
- Backend: Flask, JWT auth, SQLAlchemy, Flask-Bcrypt, Flask-CORS
- AI/NLP: spaCy, sentence-transformers, HuggingFace Transformers, OpenAI fallback hook
- Database: PostgreSQL
- DevOps: Docker, Docker Compose

## Project Structure

```text
adaptive-quiz-generator/
├── frontend/
├── backend/
├── database/
└── docker/
```

## Features

- User authentication with JWT, profile management, subject preferences, and difficulty preference
- Content ingestion for PDF files, URLs, and raw text
- NLP pipeline for cleaning, segmentation, keyword extraction, concept extraction, and chunking
- Automatic generation of MCQ, fill-in-the-blank, true/false, and short answer questions
- Adaptive quiz flow based on user accuracy and response time
- Results dashboard with score, accuracy, response time, and charts
- Admin dashboard for users, questions, moderation, and analytics

## Backend API

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `PUT /auth/profile`

### Content

- `POST /content/upload`
- `POST /content/url`
- `POST /content/text`

### Quiz

- `GET /quiz/start?content_id=<id>`
- `POST /quiz/answer`
- `GET /quiz/next?quiz_id=<id>`
- `GET /quiz/result/<quiz_id>`

### Admin

- `GET /admin/users`
- `GET /admin/questions`
- `DELETE /admin/question/<id>`
- `GET /admin/analytics`

All responses are JSON.

## Local Setup In VS Code

### 1. Start PostgreSQL

Use a local PostgreSQL instance or Docker. Create a database named `adaptive_quiz`.

```sql
\i database/schema.sql
```

### 2. Backend Setup

```bash
cd /Users/maruthichethan/Desktop/off/quiz\ project/adaptive-quiz-generator/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
python app.py
```

The API runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd /Users/maruthichethan/Desktop/off/quiz\ project/adaptive-quiz-generator/frontend
npm install
npm run dev
```

The UI runs on `http://localhost:5173`.

## Docker Compose

```bash
cd /Users/maruthichethan/Desktop/off/quiz\ project/adaptive-quiz-generator/docker
docker compose up --build
```

## CI/CD With GitHub Actions

This project includes GitHub Actions workflows in `.github/workflows/`.

- `ci.yml`
  - Runs on every push and pull request
  - Compiles backend Python files
  - Runs a lightweight backend smoke test without downloading large AI models
  - Builds the frontend with Vite
  - Verifies both backend and frontend Docker images can be built

- `cd.yml`
  - Runs on every push to `main`
  - Builds and publishes Docker images to GitHub Container Registry (`ghcr.io`)
  - Publishes:
    - `ghcr.io/<your-user-or-org>/<repo>-backend`
    - `ghcr.io/<your-user-or-org>/<repo>-frontend`

### GitHub Setup

1. Push this repository to GitHub.
2. Enable GitHub Actions for the repository.
3. If you want the frontend image to call a deployed backend, add a repository variable:
   - `VITE_API_BASE_URL`
4. Push to `main` to trigger image publishing.

### CI/CD Outcome

- Any code change or new file pushed to GitHub triggers CI automatically.
- Every push to `main` automatically rebuilds and updates the published Docker images.

## Notes On AI Models

- The backend attempts to use spaCy, sentence-transformers, and HuggingFace models when installed and available.
- Question generation includes a deterministic heuristic fallback so the app remains usable locally without heavyweight model downloads.
- If `OPENAI_API_KEY` is configured, the project is prepared for an OpenAI fallback workflow.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS restrictions configurable through environment variables

## Recommended Improvements

- Add Alembic migrations
- Add background jobs for heavy ingestion workloads
- Add persistent object storage for uploaded PDFs
- Replace heuristic generation with tuned model prompts or a fine-tuned generator
