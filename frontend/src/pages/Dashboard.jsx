import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, UserRound } from "lucide-react";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getStoredUser } from "@/lib/auth";
import api from "@/lib/api";

const questionCountOptions = [5, 10, 15, 20, 25, 30];

export default function Dashboard() {
  const user = getStoredUser();
  const [profile, setProfile] = useState(user);
  const [quizStats, setQuizStats] = useState({ total: 0, completed: 0, averageAccuracy: 0 });
  const [contentItems, setContentItems] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    api.get("/auth/profile").then(({ data }) => setProfile(data)).catch(() => {});
    api.get("/content").then(({ data }) => setContentItems(data.content || [])).catch(() => {});
  }, []);

  return (
    <PageShell
      title={`Welcome, ${profile?.name || "Learner"}`}
      subtitle="Upload learning content, launch adaptive quizzes, and track how performance changes over time."
      actions={
        <div className="flex gap-3">
          <Link to="/profile">
            <Button variant="outline">
              <UserRound size={16} className="mr-2" />
              Profile
            </Button>
          </Link>
          <Link to="/upload">
            <Button>
              <Upload size={16} className="mr-2" />
              Upload Content
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Role" value={profile?.role || "learner"} hint="JWT-protected account access" />
        <StatCard
          label="Preferred Difficulty"
          value={profile?.difficulty_preference || "Medium"}
          hint="Used as the starting level for new quizzes"
        />
        <StatCard
          label="Subjects"
          value={(profile?.subject_preferences || []).length || 0}
          hint={(profile?.subject_preferences || []).join(", ") || "No subjects saved"}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Learning Workflow</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "1. Ingest content from PDF, URL, or raw text",
              "2. Generate structured chunks and question sets",
              "3. Take adaptive quizzes and review analytics",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-white/60 p-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold">Status Snapshot</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
              <span>Total quizzes</span>
              <strong>{quizStats.total}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
              <span>Completed quizzes</span>
              <strong>{quizStats.completed}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
              <span>Average accuracy</span>
              <strong>{quizStats.averageAccuracy}%</strong>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="text-2xl font-semibold">Recent Content</h2>
        {contentItems.length === 0 ? (
          <p className="mt-4 text-slate-500">No uploaded content yet. Use Upload Content to generate your first quiz.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {contentItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.source_type.toUpperCase()} · {(item.keywords || []).slice(0, 4).join(", ")}
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="w-[160px]">
                    <Select
                      value={String(questionCounts[item.id] || 10)}
                      onChange={(event) =>
                        setQuestionCounts((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }))
                      }
                    >
                      {questionCountOptions.map((count) => (
                        <option key={count} value={count}>
                          {count} questions
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Link to={`/quiz/${item.id}?questions=${questionCounts[item.id] || 10}`}>
                    <Button
                      onClick={() => localStorage.setItem("aqg_latest_content_id", String(item.id))}
                    >
                      Start Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
