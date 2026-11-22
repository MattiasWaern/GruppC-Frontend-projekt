import type { ReactNode } from "react";

interface InfoPageProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

export default function InfoPage({ title, intro, children }: InfoPageProps) {
  return (
    <section className="mx-auto max-w-3xl py-8">
      <h1 className="mb-4 text-3xl font-semibold md:text-4xl">{title}</h1>
      {intro && <p className="mb-8 text-lg text-white/70">{intro}</p>}
      <div className="space-y-4 leading-relaxed text-white/70">{children}</div>
    </section>
  );
}