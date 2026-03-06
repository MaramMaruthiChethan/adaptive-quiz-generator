import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, FileText, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { icon: FileText, title: "Ingest Content", description: "Upload PDFs, raw text, or URLs and turn them into structured learning chunks." },
  { icon: Brain, title: "Generate Questions", description: "Create MCQ, fill-in-the-blank, true/false, and short answer questions automatically." },
  { icon: BarChart3, title: "Track Analytics", description: "See scores, response time, adaptive difficulty trends, and admin-level performance signals." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={16} />
              AI-driven adaptive assessment system
            </div>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[1.05] tracking-tight">
              Build quizzes that react to learner performance in real time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Adaptive Quiz & Question Generator transforms learning materials into quizzes,
              measures outcomes, and adjusts difficulty dynamically.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg">
                  Launch Workspace
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4"
          >
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Adaptive Engine</p>
              <h3 className="mt-4 text-3xl font-semibold">Accuracy-aware difficulty control</h3>
              <p className="mt-3 max-w-md text-blue-100">
                Increase difficulty above 80% accuracy and step down below 40% to keep learners challenged but not overwhelmed.
              </p>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <p className="text-sm text-slate-500">Question Types</p>
                <p className="mt-3 text-4xl font-semibold">4</p>
                <p className="mt-2 text-sm text-slate-500">MCQ, Fill, T/F, Short Answer</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Admin Visibility</p>
                <p className="mt-3 text-4xl font-semibold">360°</p>
                <p className="mt-2 text-sm text-slate-500">Users, quizzes, questions, analytics</p>
              </Card>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-slate-600">{description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
