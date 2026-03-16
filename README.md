# Adaptive Quiz & Question Generator

Adaptive Quiz & Question Generator is a full-stack local-first project that ingests educational content, processes it with NLP, generates quizzes automatically, adapts question difficulty based on learner performance, and exposes analytics through an admin dashboard.

## Architecture

```mermaid
flowchart LR
    subgraph Client
      Browser["React + Vite UI"]
    end

    subgraph Backend
      API["Flask API"]
      Auth["JWT Auth"]
      NLP["NLP Engine (spaCy / Transformers)"]
      QGen["Question Generator"]
      Adaptive["Adaptive Engine"]
    end

    subgraph Data
      DB[(PostgreSQL)]
    end

    subgraph Storage
      Uploads["PDF/Text Input"]
    end

    Browser <-->|Axios| API
    API --> Auth
    API --> NLP
    NLP --> QGen
    API --> Adaptive
    API --> DB
    API --> Uploads
    QGen --> DB
    Adaptive --> DB
```

## User Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant BE as Backend (Flask)
    participant NLP as NLP/QGen
    participant DB as PostgreSQL

    U->>FE: Upload PDF / Text / URL
    FE->>BE: POST /content/...
    BE->>NLP: Clean + chunk text
    NLP->>NLP: Generate questions
    NLP-->>BE: Questions + metadata
    BE->>DB: Store content + questions
    U->>FE: Start Quiz (select question count)
    FE->>BE: GET /quiz/start
    BE->>DB: Fetch questions
    BE-->>FE: First question
    U->>FE: Submit answers
    FE->>BE: POST /quiz/answer
    BE->>BE: Adaptive logic update
    BE-->>FE: Next question / results
    FE-->>U: Results & analytics
```

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

## Prerequisites

- Node.js 20+
- Python 3.11 (for local dev; Docker images include runtime)
- PostgreSQL 14+ running locally (or via Docker)
- Git, npm, pip

## Environment Variables

Create `.env` at repo root (or export in shell). Common keys:

```env
SECRET_KEY=change-me-in-production
JWT_SECRET_KEY=change-me-jwt-secret
DATABASE_URL=postgresql://quiz_user:quiz_password@localhost:5432/adaptive_quiz
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAILS=admin@example.com
OPENAI_API_KEY=           # optional
OPENAI_MODEL=gpt-4o-mini  # optional
VITE_API_BASE_URL=http://localhost:5000
```

## Quick Start (Manual)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

```bash
# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Backend default is `http://localhost:5000`.

## Quick Start (Docker Compose)

```bash
cd docker
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Postgres: `localhost:5432` (credentials from `docker-compose.yml`)

## Running Tests / Smoke Checks

Lightweight backend smoke (does not download large models):

```bash
cd backend
python - <<'PY'
from ai_engine.text_processor import TextProcessor
from ai_engine.question_generator import QuestionGenerator
sample = "Divide and conquer splits a problem, solves parts, then combines."
processed = TextProcessor().process(sample)
questions = QuestionGenerator().generate(processed["chunks"])
assert processed["chunks"] and questions
print("smoke ok")
PY
```

Frontend type/build check:

```bash
cd frontend
npm run build
```

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

## Troubleshooting

- **Port 5000 already in use**: set `FLASK_RUN_PORT=5001` and update `VITE_API_BASE_URL=http://localhost:5001`.
- **Postgres role not found**: create the role from `DATABASE_URL`, or change `DATABASE_URL` to use your current OS user.
- **PDF contains images only**: pdfminer can’t read scanned PDFs—use text mode or a searchable PDF.
- **Model downloads too heavy**: set `LIGHTWEIGHT_MODE=1` (disables spaCy model + transformer pipeline; heuristic generation still works).

## Recommended Improvements

- Add Alembic migrations
- Add background jobs for heavy ingestion workloads
- Add persistent object storage for uploaded PDFs
- Replace heuristic generation with tuned model prompts or a fine-tuned generator
- Add end-to-end tests and contract tests for the quiz/adaptive flow
- Publish a small demo dataset and seed script

## Contributing

1. Fork + branch from `main`.
2. Run `npm run build` (frontend) and backend smoke before PRs.
3. Ensure CI passes; add tests for logic changes.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
