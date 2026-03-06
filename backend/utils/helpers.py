import math
import re


def normalize_text(text):
    return re.sub(r"\s+", " ", (text or "")).strip()


def safe_average(values):
    return sum(values) / len(values) if values else 0


def percentile_label(score):
    if score >= 0.8:
        return "Excellent"
    if score >= 0.6:
        return "Good"
    if score >= 0.4:
        return "Improving"
    return "Needs Attention"


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def round2(value):
    return math.floor((value or 0) * 100) / 100
