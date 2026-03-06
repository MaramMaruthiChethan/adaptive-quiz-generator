import { Card } from "@/components/ui/card";

export default function ChartCard({ title, children }) {
  return (
    <Card className="h-full">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="h-[280px]">{children}</div>
    </Card>
  );
}
