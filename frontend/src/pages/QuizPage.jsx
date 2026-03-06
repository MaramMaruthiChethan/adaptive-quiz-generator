import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

export default function QuizPage() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const questionLimit = Math.min(
    30,
    Math.max(5, Number(searchParams.get("questions") || 10))
  );

  useEffect(() => {
    api
      .get(`/quiz/start?content_id=${contentId}&question_limit=${questionLimit}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setQuestion(data.question);
      })
      .finally(() => setLoading(false));
  }, [contentId, questionLimit]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = useMemo(
    () => Math.min(100, ((history.length + (question ? 1 : 0)) / questionLimit) * 100),
    [history.length, question, questionLimit]
  );

  async function submitAnswer() {
    const { data } = await api.post("/quiz/answer", {
      quiz_id: quiz.id,
      question_id: question.id,
      answer,
      response_time: seconds,
    });

    setHistory((current) => [...current, { question, answer, correct: data.response.is_correct }]);
    setQuiz(data.quiz);
    setAnswer("");
    setSeconds(0);

    if (data.completed || !data.next_question) {
      navigate(`/results/${quiz.id}`);
      return;
    }
    setQuestion(data.next_question);
  }

  function previousQuestion() {
    const previous = history[history.length - 1];
    if (!previous) {
      return;
    }
    setQuestion(previous.question);
    setAnswer(previous.answer);
    setHistory((current) => current.slice(0, -1));
  }

  if (loading) {
    return <PageShell title="Quiz" subtitle="Loading adaptive session..." />;
  }

  return (
    <PageShell title="Adaptive Quiz" subtitle="Difficulty changes based on your accuracy and response speed.">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Difficulty</p>
              <p className="text-xl font-semibold">{quiz?.current_difficulty}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
              <p className="text-sm text-slate-500">Timer</p>
              <p className="text-2xl font-semibold">{seconds}s</p>
            </div>
          </div>
          <Progress value={progress} />
          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-primary/70">{question?.question_type}</p>
            <h2 className="mt-3 text-2xl font-semibold">{question?.question_text}</h2>
          </div>
          <div className="mt-6 space-y-3">
            {question?.options?.length ? (
              question.options.map((option) => (
                <button
                  key={option}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    answer === option ? "border-primary bg-primary/10" : "border-border bg-white/70"
                  }`}
                  onClick={() => setAnswer(option)}
                >
                  {option}
                </button>
              ))
            ) : (
              <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer" />
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={previousQuestion}>Previous</Button>
            <Button onClick={submitAnswer}>Next Question</Button>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">Score</p>
            <p className="text-3xl font-semibold">{quiz?.score || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Accuracy</p>
            <p className="text-3xl font-semibold">{Math.round((quiz?.accuracy || 0) * 100)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Answered</p>
            <p className="text-3xl font-semibold">{history.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Question limit</p>
            <p className="text-3xl font-semibold">{quiz?.max_questions || questionLimit}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg. response time</p>
            <p className="text-3xl font-semibold">{Math.round(quiz?.average_response_time || 0)}s</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
