import { Card } from "@/components/ui/card";

export default function StatCard({ label, value, hint }) {
  return (
    <Card className="space-y-2">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
    </Card>
  );
}
