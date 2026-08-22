import { useState, type ReactNode } from "react";
import Nav from "@/components/layout/Nav";
import SiteFooter from "@/components/layout/SiteFooter";

/* ── Roles ── */
const ROLES = [
  "software & automation",
  "product",
  "ai & ml",
  "leadership & gtm",
] as const;
type Role = (typeof ROLES)[number];

/* ── tl;dr clauses (each tagged with the roles it belongs to) ── */
type Clause = { node: ReactNode; roles: Role[] };
const tldr: Clause[] = [
  {
    node: (
      <>
        built bots, API integrations &amp; a{" "}
        <strong>real-time billing dashboard</strong> at almedia
      </>
    ),
    roles: ["software & automation", "product"],
  },
  {
    node: (
      <>
        cut a finance team&apos;s manual inbox work by{" "}
        <strong>~2 hrs/day</strong> with an intent-routing n8n automation
      </>
    ),
    roles: ["software & automation", "ai & ml"],
  },
  {
    node: (
      <>
        led a <strong>10-person</strong> team and secured{" "}
        <strong>$10k</strong> from google &amp; perplexity for a global hackathon
      </>
    ),
    roles: ["leadership & gtm"],
  },
  {
    node: <>shipped a real-time cultural-translation tool on the claude api</>,
    roles: ["product", "ai & ml"],
  },
  {
    node: (
      <>
        led product on sustainable 3d-printed running shoes, partnered with{" "}
        modwall for distribution
      </>
    ),
    roles: ["product", "leadership & gtm"],
  },
];

/* ── Experience & projects ── */
type Entry = {
  org: string;
  meta: string;
  title: string;
  bullets: string[];
  roles: Role[];
  href?: string;
};

const experience: Entry[] = [
  {
    org: "almedia",
    meta: "working student",
    title: "finance automations",
    bullets: [
      "built automation solutions — bots, API integrations, and a billing dashboard with real-time sync",
      "shipped a full-stack billing page for customers end-to-end",
    ],
    roles: ["software & automation", "product"],
  },
  {
    org: "ai consensus",
    meta: "hackathon lead · head of partnerships",
    title: "leadership & partnerships",
    bullets: [
      "led a 10-person team to run a global hackathon",
      "secured $10k in sponsorships from google & perplexity",
    ],
    roles: ["leadership & gtm"],
  },
  {
    org: "printive",
    meta: "product team lead",
    title: "sustainable footwear",
    bullets: [
      "designed sustainable 3d-printed running shoes with detachable soles",
      "partnered with modwall for distribution",
    ],
    roles: ["product", "leadership & gtm"],
  },
];

const projects: Entry[] = [
  {
    org: "overdue invoice bot",
    meta: "python · automation",
    title: "a/r follow-up automation",
    bullets: [
      "reduced average invoice payment time and administrative A/R hours",
      "integrated notion, easybill, slack, and telegram APIs",
    ],
    roles: ["software & automation"],
    href: "https://github.com/klarakonkel/overdue-invoice-reminders.git",
  },
  {
    org: "gmail inbox automation",
    meta: "n8n · finance ops",
    title: "intent-based email routing",
    bullets: [
      "classified emails by intent and routed invoices straight to accounting software",
      "auto-tagged from 900 client labels, cutting ~2 hrs of manual work daily",
    ],
    roles: ["software & automation", "ai & ml"],
  },
  {
    org: "context",
    meta: "react · claude api",
    title: "real-time cultural translation",
    bullets: [
      "surfaces implicit cultural cues and tone during international calls",
      "gives real-time feedback to adjust approach and close more deals",
    ],
    roles: ["product", "ai & ml"],
    href: "https://github.com/aokumo-yh/contextai",
  },
];

/* ── Component ── */
const Work = () => {
  const [active, setActive] = useState<Role[]>([]);

  const toggle = (role: Role) =>
    setActive((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const matches = (roles: Role[]) =>
    active.length === 0 || roles.some((r) => active.includes(r));

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="container flex-1 pt-6 md:pt-10 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">work</h1>

        {/* ── Filter ── */}
        <div className="flex flex-wrap items-center gap-2.5 mb-12">
          <span className="label-tag mr-1">filter by role:</span>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className="role-pill"
              data-active={active.includes(role)}
              onClick={() => toggle(role)}
            >
              {role}
              {active.includes(role) && <span aria-hidden>×</span>}
            </button>
          ))}
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => setActive([])}
              className="text-sm text-muted-foreground hover:text-foreground story-link ml-1"
            >
              clear all ×
            </button>
          )}
        </div>

        {/* ── tl;dr ── */}
        <section className="mb-14">
          <p className="mb-4">
            <span className="text-lg font-semibold">tl;dr</span>{" "}
            <span className="label-tag">including but not limited to</span>
          </p>
          <p className="text-xl md:text-2xl leading-relaxed">
            {tldr.map((c, i) => (
              <span key={i} className={matches(c.roles) ? "" : "dimmed"}>
                {c.node}
                {i < tldr.length - 1 && (
                  <span className="text-muted-foreground"> · </span>
                )}
              </span>
            ))}
          </p>
        </section>

        {/* ── Experience ── */}
        <WorkGroup title="experience" entries={experience} matches={matches} />

        {/* ── Projects ── */}
        <WorkGroup title="projects" entries={projects} matches={matches} />
      </main>

      <SiteFooter />
    </div>
  );
};

/* ── Group of entries ── */
const WorkGroup = ({
  title,
  entries,
  matches,
}: {
  title: string;
  entries: Entry[];
  matches: (roles: Role[]) => boolean;
}) => (
  <section className="mb-14">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <div className="divide-y divide-border">
      {entries.map((e) => {
        const on = matches(e.roles);
        return (
          <article
            key={e.org}
            className={`py-6 transition-opacity duration-300 ${
              on ? "opacity-100" : "opacity-30"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="text-lg">
                {e.href ? (
                  <a
                    href={e.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold story-link"
                  >
                    {e.org}
                  </a>
                ) : (
                  <span className="font-semibold">{e.org}</span>
                )}{" "}
                <span className="text-muted-foreground italic text-base">
                  · {e.title}
                </span>
              </h3>
              <span className="label-tag">{e.meta}</span>
            </div>

            <ul className="mt-3 space-y-1.5">
              {e.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-[15px] text-muted-foreground leading-relaxed pl-4 relative"
                >
                  <span className="absolute left-0">–</span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.roles.map((r) => (
                <span
                  key={r}
                  className="text-[11px] tracking-wide border border-border rounded-full px-2.5 py-0.5 text-muted-foreground"
                >
                  {r}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

export default Work;
