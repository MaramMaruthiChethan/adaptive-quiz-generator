import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const colors = ["#2563eb", "#4f46e5", "#0f766e"];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  async function loadData() {
    const [usersRes, questionsRes, analyticsRes] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/questions"),
      api.get("/admin/analytics"),
    ]);
    setUsers(usersRes.data.users);
    setQuestions(questionsRes.data.questions);
    setAnalytics(analyticsRes.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function archiveQuestion(questionId) {
    await api.delete(`/admin/question/${questionId}`);
    loadData();
  }

  return (
    <PageShell title="Admin Dashboard" subtitle="Moderate generated questions, monitor learners, and inspect system-wide trends.">
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Users" value={analytics?.totals?.users || 0} />
        <StatCard label="Quizzes" value={analytics?.totals?.quizzes || 0} />
        <StatCard label="Completed" value={analytics?.totals?.completed_quizzes || 0} />
        <StatCard label="Avg. Accuracy" value={`${analytics?.totals?.average_accuracy || 0}%`} />
        <StatCard label="Avg. Time" value={`${analytics?.totals?.average_response_time || 0}s`} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Difficulty Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics?.difficulty_breakdown || []}
                dataKey="count"
                nameKey="difficulty"
                outerRadius={92}
                label
              >
                {(analytics?.difficulty_breakdown || []).map((entry, index) => (
                  <Cell key={entry.difficulty} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Question Inventory">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={questions.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chunk_index" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold">Users</h2>
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{user.role}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold">Moderate Questions</h2>
          <div className="mt-5 space-y-3">
            {questions.slice(0, 10).map((question) => (
              <div key={question.id} className="rounded-2xl bg-white/70 p-4">
                <p className="font-semibold">{question.question_text}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>{question.question_type} · {question.difficulty}</span>
                  <Button size="sm" variant="danger" onClick={() => archiveQuestion(question.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
