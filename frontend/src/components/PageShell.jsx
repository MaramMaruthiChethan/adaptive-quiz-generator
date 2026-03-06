import { motion } from "framer-motion";
import Navbar from "./Navbar";

export default function PageShell({ title, subtitle, children, actions }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.32em] text-primary/70">
              Adaptive Learning
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-3 max-w-3xl text-slate-600">{subtitle}</p>}
          </div>
          {actions}
        </motion.div>
        {children}
      </main>
    </div>
  );
}
