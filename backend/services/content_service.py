import io
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from pdfminer.high_level import extract_text

from ai_engine.question_generator import QuestionGenerator
from ai_engine.text_processor import TextProcessor

text_processor = TextProcessor()
question_generator = QuestionGenerator()


def parse_pdf(file_storage):
    file_bytes = file_storage.read()
    if not file_bytes:
        raise ValueError("The uploaded PDF is empty.")

    try:
        extracted_text = extract_text(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError("Unable to extract text from this PDF. Try another PDF or paste the text directly.") from exc

    if not extracted_text or not extracted_text.strip():
        raise ValueError("No readable text was found in this PDF. Try a text-based PDF or use raw text mode.")

    return extracted_text


def parse_url(url):
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for script in soup(["script", "style"]):
        script.extract()
    title = soup.title.string.strip() if soup.title and soup.title.string else urlparse(url).netloc
    text = " ".join(soup.stripped_strings)
    return title, text


def process_text(raw_text):
    analysis = text_processor.process(raw_text)
    if not analysis["cleaned_text"]:
        raise ValueError("No usable text was found after processing the content.")
    questions = question_generator.generate(analysis["chunks"])
    if not questions:
        raise ValueError("Questions could not be generated from this content.")
    return analysis, questions
