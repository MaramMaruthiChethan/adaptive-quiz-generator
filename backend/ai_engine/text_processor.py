import re
from collections import Counter

from config import Config

try:
    import spacy
except Exception:  # pragma: no cover
    spacy = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


class TextProcessor:
    def __init__(self):
        self.nlp = self._load_spacy()
        self.embedding_model = self._load_embeddings()

    def _load_spacy(self):
        if Config.LIGHTWEIGHT_MODE:
            return None
        if not spacy:
            return None
        try:
            nlp = spacy.load("en_core_web_sm")
        except Exception:
            nlp = spacy.blank("en")

        if "sentencizer" not in nlp.pipe_names and "parser" not in nlp.pipe_names and "senter" not in nlp.pipe_names:
            nlp.add_pipe("sentencizer")
        return nlp

    def _load_embeddings(self):
        if Config.LIGHTWEIGHT_MODE:
            return None
        if not SentenceTransformer:
            return None
        try:
            return SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            return None

    def clean_text(self, text):
        if not text:
            return ""

        def keep_line(line: str) -> bool:
            stripped = line.strip()
            if not stripped:
                return False
            lower = stripped.lower()
            # Drop page numbers and chapter headers like "Page 12"
            if re.match(r"^page\s*\d+$", lower):
                return False
            # Drop lines that are mostly digits or codes
            letters = sum(c.isalpha() for c in stripped)
            digits = sum(c.isdigit() for c in stripped)
            if digits > letters:
                return False
            # Drop very short boilerplate lines
            if len(stripped.split()) < 4 and digits > 0:
                return False
            # Drop obvious code-ish lines
            if re.search(r"[{};<>]|class\\s+|import\\s+|public\\s+|void\\s+|def\\s+", stripped):
                return False
            return True

        # Filter line by line to strip page numbers, codes, and boilerplate
        filtered_lines = [ln for ln in (text or "").splitlines() if keep_line(ln)]
        text = " ".join(filtered_lines)
        text = re.sub(r"\\s+", " ", text)
        text = re.sub(r"[^\\w\\s.,;:!?()-]", "", text)
        return text.strip()

    def segment_sentences(self, text):
        if self.nlp:
            doc = self.nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
            if sentences:
                return sentences
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]

    def extract_keywords(self, text, limit=12):
        words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
        stop_words = {
            "that",
            "this",
            "with",
            "from",
            "have",
            "into",
            "their",
            "about",
            "there",
            "which",
            "will",
            "would",
            "could",
            "should",
        }
        ranked = Counter(word for word in words if word not in stop_words)
        return [word for word, _ in ranked.most_common(limit)]

    def extract_concepts(self, text, limit=10):
        if self.nlp:
            doc = self.nlp(text)
            entities = [ent.text for ent in doc.ents if len(ent.text) > 2]
            noun_chunks = []
            if "parser" in self.nlp.pipe_names:
                noun_chunks = [chunk.text for chunk in doc.noun_chunks if len(chunk.text) > 3]
            items = entities + noun_chunks
            deduped = list(dict.fromkeys(items))
            if deduped:
                return deduped[:limit]
        return self.extract_keywords(text, limit=limit)

    def build_chunks(self, text, chunk_size=3):
        sentences = self.segment_sentences(text)
        chunks = []
        for index in range(0, len(sentences), chunk_size):
            part = sentences[index : index + chunk_size]
            chunk_text = " ".join(part)
            # Skip tiny or noisy chunks
            words = chunk_text.split()
            letters = sum(c.isalpha() for c in chunk_text)
            if len(words) < 6 or letters < len(chunk_text) * 0.6:
                continue
            chunks.append(
                {
                    "chunk_index": len(chunks),
                    "text": chunk_text,
                    "sentences": part,
                    "keywords": self.extract_keywords(chunk_text, limit=6),
                    "concepts": self.extract_concepts(chunk_text, limit=6),
                    "embedding_ready": bool(self.embedding_model),
                }
            )
        return chunks

    def process(self, text):
        cleaned = self.clean_text(text)
        chunks = self.build_chunks(cleaned)
        return {
            "cleaned_text": cleaned,
            "sentences": self.segment_sentences(cleaned),
            "keywords": self.extract_keywords(cleaned),
            "concepts": self.extract_concepts(cleaned),
            "chunks": chunks,
        }
