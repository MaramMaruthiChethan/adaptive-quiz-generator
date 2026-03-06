# API Documentation

Base URL: `http://localhost:5000`

## Authentication

### `POST /auth/register`

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secure-password",
  "subject_preferences": ["Math", "Science"],
  "difficulty_preference": "Medium"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "learner"
  }
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "jane@example.com",
  "password": "secure-password"
}
```

### `GET /auth/profile`

Headers:

```text
Authorization: Bearer <jwt>
```

### `PUT /auth/profile`

Request:

```json
{
  "name": "Jane Doe",
  "subject_preferences": ["Physics", "Biology"],
  "difficulty_preference": "Hard"
}
```

## Content Ingestion

### `POST /content/text`

```json
{
  "title": "Photosynthesis Notes",
  "text": "Photosynthesis is the process by which green plants..."
}
```

### `POST /content/url`

```json
{
  "url": "https://example.com/education/article"
}
```

### `POST /content/upload`

Multipart form-data:

- `title`
- `file`

## Quiz

### `GET /quiz/start?content_id=1`

Starts a new adaptive quiz session for the given content.

### `POST /quiz/answer`

```json
{
  "quiz_id": 1,
  "question_id": 4,
  "answer": "Chlorophyll",
  "response_time": 8.4
}
```

### `GET /quiz/next?quiz_id=1`

Gets the next unanswered question for the active quiz.

### `GET /quiz/result/1`

Returns the quiz summary, response history, score, accuracy, response time, and final adaptive difficulty.

## Admin

Admin routes require a JWT from a user with `role = admin`.

### `GET /admin/users`
### `GET /admin/questions`
### `DELETE /admin/question/<id>`
### `GET /admin/analytics`

## Error Format

Errors use JSON:

```json
{
  "message": "Description of the error"
}
```
