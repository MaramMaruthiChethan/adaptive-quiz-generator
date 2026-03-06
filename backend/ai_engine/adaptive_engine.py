DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"]


class AdaptiveEngine:
    def adjust_difficulty(self, accuracy, previous_difficulty):
        current_index = DIFFICULTY_ORDER.index(previous_difficulty or "Medium")
        if accuracy > 0.8 and current_index < len(DIFFICULTY_ORDER) - 1:
            current_index += 1
        elif accuracy < 0.4 and current_index > 0:
            current_index -= 1
        return DIFFICULTY_ORDER[current_index]

    def summarize_performance(self, responses):
        total = len(responses)
        if total == 0:
            return {"accuracy": 0, "avg_response_time": 0}
        correct = sum(1 for response in responses if response.is_correct)
        avg_time = sum(response.response_time for response in responses) / total
        return {"accuracy": correct / total, "avg_response_time": avg_time}
