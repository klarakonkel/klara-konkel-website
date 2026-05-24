import { useState } from "react";

type Role = {
  company: string;
  title: string;
  details: string;
  tags: string[];
  pos: number; // 0 = pure software, 100 = pure product management
};

const roles: Role[] = [
  {
    company: "Almedia",
    title: "Finance Automations — Working Student",
    details: "Built automation solutions including bots, API integrations, a billing dashboard with real-time sync, and a full-stack billing page for customers.",
    tags: ["Python", "APIs", "Full-stack", "Automation", "Billing Systems"],
    pos: 18,
  },
  {
    company: "Printive",
    title: "Product Team Lead",
    details: "Designed sustainable 3D-printed running shoes with detachable soles. Led cross-functional team and partnered with Modwall for distribution.",
    tags: ["Product Design", "Team Leadership", "Partnerships", "Sustainability", "3D Printing"],
    pos: 58,
  },
  {
    company: "AI Consensus",
    title: "Hackathon Lead & Head of Partnerships",
    details: "Led a 10-person team to organise a global AI hackathon. Secured $10k in sponsorships from Google & Perplexity.",
    tags: ["Event Leadership", "Sponsorship", "Stakeholder Management", "Community Building"],
    pos: 82,
  },
];

const Experience = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const active = roles.find((r) => r.company === selected) ?? null;

  return (
    <section id="experience">
      <p className="label-tag">Field Notes</p>
      <h2 className="font-serif text-4xl font-bold mt-1 mb-2">Experience</h2>
      <p className="text-sm text-muted-foreground mb-10 max-w-prose">
        I believe that building transferable skills is essential to keep evolving
        personally and professionally. That&apos;s why I wear many hats.
      </p>

      {/* ── Spectrum ── */}
      <div>
        {/* Axis labels */}
        <div className="flex justify-between mb-3">
          <span className="label-tag">Software Engineering</span>
          <span className="label-tag">Product Management</span>
        </div>

        {/* Track + bubbles */}
        <div className="relative h-24 select-none">
          {/* Gradient track */}
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-gradient-to-r from-border via-border to-border" />

          {roles.map((r) => (
            <button
              key={r.company}
              onClick={() => setSelected(selected === r.company ? null : r.company)}
              style={{ left: `${r.pos}%` }}
              className={`
                absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                w-20 h-20 rounded-full border text-center
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 cursor-pointer
                ${selected === r.company
                  ? "bg-foreground text-background border-foreground scale-110 shadow-md"
                  : "bg-background border-border hover:border-foreground hover:scale-105"}
              `}
            >
              <span className="text-[9px] font-semibold leading-tight tracking-wide uppercase px-1">
                {r.company}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          active ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        {active && (
          <div className="border-t border-border pt-6">
            <p className="label-tag">{active.company}</p>
            <h3 className="font-serif text-xl font-bold mt-1 mb-3">{active.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              {active.details}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {active.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-wide border border-border px-2.5 py-1 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
