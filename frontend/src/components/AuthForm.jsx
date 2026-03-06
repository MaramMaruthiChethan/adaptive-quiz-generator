import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { setSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Navbar from "./Navbar";

const difficultyOptions = ["Easy", "Medium", "Hard"];

export default function AuthForm({ mode = "login" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject_preferences: "Science,Math",
    difficulty_preference: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isRegister
        ? {
            ...form,
            subject_preferences: form.subject_preferences
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          }
        : { email: form.email, password: form.password };

      const { data } = await api.post(isRegister ? "/auth/register" : "/auth/login", payload);
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
            Production-Ready Learning Stack
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight">
            Create adaptive quizzes from PDFs, URLs, and notes in minutes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            NLP processing, difficulty-aware question generation, learner performance tracking,
            and admin analytics in a single local-first system.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{isRegister ? "Create account" : "Welcome back"}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {isRegister
                  ? "Register with your learning preferences."
                  : "Sign in to continue building adaptive quizzes."}
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              {isRegister && (
                <>
                  <Input
                    placeholder="Subjects (comma separated)"
                    value={form.subject_preferences}
                    onChange={(event) =>
                      setForm({ ...form, subject_preferences: event.target.value })
                    }
                  />
                  <Select
                    value={form.difficulty_preference}
                    onChange={(event) =>
                      setForm({ ...form, difficulty_preference: event.target.value })
                    }
                  >
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </Select>
                </>
              )}
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              {isRegister ? "Already have an account?" : "Need an account?"}{" "}
              <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-primary">
                {isRegister ? "Login" : "Register"}
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
