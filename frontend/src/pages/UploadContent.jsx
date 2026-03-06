import { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

const questionCountOptions = [5, 10, 15, 20, 25, 30];

export default function UploadContent() {
  const [mode, setMode] = useState("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState("10");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setResult(null);

    try {
      let response;
      if (mode === "text") {
        if (!text.trim()) {
          setError("Paste some text before processing.");
          return;
        }
        response = await api.post("/content/text", { title, text });
      } else if (mode === "url") {
        if (!url.trim()) {
          setError("Enter a URL before processing.");
          return;
        }
        response = await api.post("/content/url", { url });
      } else {
        if (!file) {
          setError("Choose a PDF file before processing.");
          return;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);
        response = await api.post("/content/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setResult(response.data.content);
      localStorage.setItem("aqg_latest_content_id", String(response.data.content.id));
    } catch (err) {
      setError(err.response?.data?.message || "Content processing failed");
    }
  }

  return (
    <PageShell title="Upload Content" subtitle="Send educational material into the NLP pipeline and generate questions automatically.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <Card>
          <div className="mb-5 flex gap-3">
            {["text", "url", "pdf"].map((item) => (
              <Button
                key={item}
                variant={mode === item ? "default" : "outline"}
                onClick={() => setMode(item)}
              >
                {item.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="space-y-4">
            <Input placeholder="Content title" value={title} onChange={(event) => setTitle(event.target.value)} />
            {mode === "text" && (
              <Textarea
                placeholder="Paste educational content here"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            )}
            {mode === "url" && (
              <Input placeholder="https://example.com/article" value={url} onChange={(event) => setUrl(event.target.value)} />
            )}
            {mode === "pdf" && (
              <Input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            )}
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button onClick={submit}>Process Content</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Generated Asset</h2>
          {!result ? (
            <p className="mt-4 text-slate-500">Content metadata, keywords, and quiz launch actions will appear here after processing.</p>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-sm text-slate-500">Title</p>
                <p className="mt-1 font-semibold">{result.title}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-sm text-slate-500">Keywords</p>
                <p className="mt-1">{(result.keywords || []).join(", ")}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-sm text-slate-500">Questions to solve</p>
                <div className="mt-2 max-w-[180px]">
                  <Select value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}>
                    {questionCountOptions.map((count) => (
                      <option key={count} value={count}>
                        {count} questions
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-sm text-slate-500">Concepts</p>
                <p className="mt-1">{(result.concepts || []).join(", ")}</p>
              </div>
              <Link to={`/quiz/${result.id}?questions=${questionCount}`}>
                <Button className="w-full">Start Quiz</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
