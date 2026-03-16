import random

from config import Config

try:
    from transformers import pipeline
except Exception:  # pragma: no cover
    pipeline = None

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None
class QuestionGenerator:
    def __init__(self):
        self.generator = self._load_hf_pipeline()
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY) if OpenAI and Config.OPENAI_API_KEY else None

    def _load_hf_pipeline(self):
        if Config.LIGHTWEIGHT_MODE:
            return None
        if not pipeline:
            return None
        try:
            return pipeline("text2text-generation", model="google/flan-t5-base")
        except Exception:
            return None

    def _infer_difficulty(self, text):
        words = len((text or "").split())
        if words < 35:
            return "Easy"
        if words < 70:
            return "Medium"
        return "Hard"

    def _distractors(self, keywords, answer):
        pool = [item.title() for item in keywords if item.lower() != answer.lower()]
        pool = list(dict.fromkeys(pool))
        selected = pool[:3]
        while len(selected) < 3:
            selected.append(f"Option {len(selected) + 1}")
        options = selected + [answer]
        random.shuffle(options)
        return options

    def _heuristic_questions(self, chunk):
        text = chunk["text"]
        keywords = [k for k in (chunk.get("keywords") or []) if k and not any(ch.isdigit() for ch in k)]
        concepts = [c for c in (chunk.get("concepts") or []) if c and not any(ch.isdigit() for ch in c)]
        anchor = (concepts or keywords or ["the main topic"])[0].title()
        keyword_answer = (keywords[0] if keywords else anchor).title()
        blank_source = text.split(".")[0].strip()
        blank_answer = keyword_answer
        blank_text = blank_source.replace(blank_answer, "_____") if blank_answer in blank_source else f"{blank_source} _____"

        return [
            {
                "question": f"What best describes {anchor} based on the passage?",
                "options": self._distractors(keywords or concepts, keyword_answer),
                "answer": keyword_answer,
                "difficulty": self._infer_difficulty(text),
                "question_type": "MCQ",
                "explanation": f"The passage emphasizes {keyword_answer} as a core idea.",
            },
            {
                "question": blank_text,
                "options": [],
                "answer": blank_answer,
                "difficulty": self._infer_difficulty(text),
                "question_type": "Fill in the blank",
                "explanation": f"The missing term is {blank_answer}.",
            },
            {
                "question": f"True or False: {text[:110].strip()}",
                "options": ["True", "False"],
                "answer": "True",
                "difficulty": self._infer_difficulty(text),
                "question_type": "True/False",
                "explanation": "The statement is directly supported by the chunk.",
            },
            {
                "question": f"Briefly explain the importance of {anchor}.",
                "options": [],
                "answer": text[:180],
                "difficulty": self._infer_difficulty(text),
                "question_type": "Short Answer",
                "explanation": f"A strong answer should mention the role of {anchor}.",
            },
        ]

    def _openai_questions(self, text):
        if not self.client:
            return None
        prompt = (
            "Generate four quiz questions from the text: one MCQ, one fill-in-the-blank, "
            "one true/false, and one short answer. Return a JSON array with question, options, "
            "answer, difficulty, question_type, explanation.\n\nText:\n"
            f"{text}"
        )
        try:
            response = self.client.responses.create(
                model=Config.OPENAI_MODEL,
                input=prompt,
                temperature=0.3,
            )
            return response.output_text
        except Exception:
            return None

    def generate(self, chunks):
        generated = []
        for chunk in chunks:
            if not chunk.get("keywords") and not chunk.get("concepts"):
                continue
            questions = self._heuristic_questions(chunk)
            for question in questions:
                question["chunk_index"] = chunk["chunk_index"]
                generated.append(question)
        return generated
