import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", subject_preferences: "", difficulty_preference: "Medium" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/auth/profile").then(({ data }) => {
      setForm({
        name: data.name,
        subject_preferences: (data.subject_preferences || []).join(", "),
        difficulty_preference: data.difficulty_preference,
      });
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name: form.name,
      subject_preferences: form.subject_preferences.split(",").map((item) => item.trim()).filter(Boolean),
      difficulty_preference: form.difficulty_preference,
    };
    const { data } = await api.put("/auth/profile", payload);
    const token = localStorage.getItem("aqg_token");
    setSession(token, data.user);
    setMessage("Profile updated successfully.");
  }

  return (
    <PageShell title="Profile" subtitle="Manage learning preferences and default adaptive difficulty.">
      <Card className="max-w-2xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input
            value={form.subject_preferences}
            onChange={(event) => setForm({ ...form, subject_preferences: event.target.value })}
            placeholder="Subjects"
          />
          <Select
            value={form.difficulty_preference}
            onChange={(event) => setForm({ ...form, difficulty_preference: event.target.value })}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </Select>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <Button>Save Changes</Button>
        </form>
      </Card>
    </PageShell>
  );
}
