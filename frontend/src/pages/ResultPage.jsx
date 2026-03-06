import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import PageShell from "@/components/PageShell";
import ChartCard from "@/components/ChartCard";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function ResultPage() {
  const { quizId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/quiz/result/${quizId}`).then((response) => setData(response.data));
  }, [quizId]);

  const chartData =
    data?.responses?.map((item, index) => ({
      index: index + 1,
      accuracy: item.is_correct ? 100 : 0,
      responseTime: item.response_time,
    })) || [];

  return (
    <PageShell
      title="Quiz Results"
      subtitle="Review performance metrics, response timing, and the final adaptive difficulty level."
      actions={
        <Link to="/upload">
          <Button>Upload More Content</Button>
        </Link>
      }
    >
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Score" value={data?.summary?.score || 0} />
        <StatCard label="Accuracy" value={`${data?.summary?.accuracy || 0}%`} />
        <StatCard label="Avg. Time" value={`${data?.summary?.average_response_time || 0}s`} />
        <StatCard label="Difficulty" value={data?.summary?.difficulty_level || "Medium"} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Accuracy Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Performance Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="responseTime" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageShell>
  );
}
