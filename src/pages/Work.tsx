import { useState, type ReactNode } from "react";
import Nav from "@/components/layout/Nav";
import SiteFooter from "@/components/layout/SiteFooter";
import { getPublicUrl } from "@/lib/utils";

/* ── Roles ── */
const ROLES = [
  "software & automation",
  "product",
  "ai & ml",
  "leadership & gtm",
] as const;
type Role = (typeof ROLES)[number];

// `youtube` src is a video id; it renders as an embedded player.
type Media = { type: "image" | "video" | "youtube"; src: string; alt: string };

type Link = { label: string; href: string };

type SubProject = {
  name?: string;
  desc: string;
  stack?: string; // rendered as a "stack:" line under the description
  learnings: string[];
  media?: Media;
  note?: string; // small muted aside under the description
  links?: Link[]; // demo / live / code links
  href?: string; // legacy single "see code" link
};

type Item = {
  id: string;
  group: "experience" | "projects";
  org: string;
  title: string; // role or one-line tagline
  meta: string; // dates · location  OR  stack
  roles: Role[];
  blurb: string; // shown in the left-hand row
  detailLabel: string; // heading above the detail cards
  intro?: ReactNode; // context shown between the header and detailLabel
  introLabel?: string; // optional label above the intro
  projects: SubProject[];
};

/* ── Data ── */
const EXPERIENCE: Item[] = [
  {
    id: "almedia",
    group: "experience",
    org: "almedia",
    title: "software engineer · working student",
    meta: "berlin · jun 2025 – present",
    roles: ["software & automation", "ai & ml", "product"],
    blurb:
      "built the accounts-receivable platform end-to-end — billing service, performance, integrations & ml reconciliation",
    detailLabel: "what i built at almedia",
    projects: [
      {
        name: "accounts-receivable billing service",
        desc: "architected and shipped a python / fastapi a/r service using hexagonal architecture that isolates domain logic from i/o for testability, replacing a manual spreadsheet-and-script process. instrumented with structured logging and metrics/alerts for billing-run observability — now bills ~1,500 revenue lines/month across 400 active clients.",
        learnings: ["fastapi", "hexagonal architecture", "observability", "python"],
      },
      {
        name: "215× faster finance dashboard",
        desc: "root-caused a bottleneck where each dashboard load triggered a 32.9 gb scan of 310k rows across 7+ heterogeneous sources (bigquery, mysql, mongodb, postgres). redesigned the data path as a monthly pre-aggregation into an indexed table — cutting p50 load time from 67s to 0.3s (~215×) and ~$310/month in query cost.",
        learnings: ["profiling", "query optimization", "bigquery", "data modeling"],
      },
      {
        name: "integrations & reliability",
        desc: "built a bidirectional hubspot ↔ easybill sync over webhooks with deduplication and ordering logic to survive bursty, out-of-order delivery. eliminated data loss during third-party outages with a durable retry queue (exponential backoff, 1–30 min), and enforced per-account-manager access at the database layer via postgres row-level security.",
        learnings: ["webhooks", "idempotency", "postgres rls", "fault tolerance"],
      },
      {
        name: "overdue-invoice slack bot",
        desc: "reduced the overdue share of open invoices from 40% to 17–25% by building a slack bot that reconciled unpaid invoices against easybill and pushed automated reminders to 100+ client channels plus per-account-manager summaries.",
        learnings: ["slack api", "automation", "reconciliation"],
      },
      {
        name: "ml reconciliation engine — in progress",
        desc: "building an invoice-payment reconciliation engine: a deterministic candidate generator (subset-sum for many-to-many matches) feeds a gradient-boosted ranker (lightgbm) whose calibrated probabilities drive a confidence-thresholded decision — auto-confirming high-precision matches and routing ambiguous cases to human review.",
        learnings: ["lightgbm", "calibration", "precision@threshold", "subset-sum"],
      },
    ],
  },
];

const PROJECTS: Item[] = [
  {
    id: "context",
    group: "projects",
    org: "context",
    title: "real-time cultural interpreter",
    meta: "hackathon, tokyo",
    roles: ["product", "ai & ml"],
    blurb: "surfaces implicit cultural cues during international calls",
    detailLabel: "the solution",
    introLabel: "the problem",
    intro: (
      <>
        having lived in different countries, i noticed how cultural differences
        quietly limit our ability to connect and to be <em>fully</em> understood
        — and how much meaning goes missing in between. in germany, “yes” means
        “yes”. in japan, “yes” can mean “i hear you”. in china, “yes” can
        sometimes mean “no”. the gap only widens in international business, where
        so many sales calls fall apart because a culturally unaware partner missed
        the social rules — coming across as rude, or simply misreading the room.
      </>
    ),
    projects: [
      {
        desc: "an ai assistant that acts as your cultural interpreter during cross-cultural business meetings. it listens to the conversation, detects cultural moments — indirect refusals, the meaning of a silence, differing communication styles — and gives instant, in-the-moment guidance on how to navigate the difference.",
        stack:
          "a react + typescript + vite front end (tailwind, recharts, lucide) over a small pipeline of ai services. elevenlabs handles speech-to-text and text-to-speech; google cloud translation (deepl as a fallback) bridges languages; and claude opus 4 is the cultural brain — reading the conversation against erin meyer's culture map (8 dimensions) to catch soft 'no's, meaningful silence, and directness, then returning structured json with the moment, an urgency level, an explanation, and 3–5 actionable suggestions. supabase stores conversation history and analytics.",
        learnings: ["product strategy", "llm apps", "real-time ux", "cross-cultural design"],
        media: { type: "image", src: "/context%20preview.png", alt: "Context preview" },
        href: "https://github.com/aokumo-yh/contextai",
      },
    ],
  },
  {
    id: "gym-optimizer",
    group: "projects",
    org: "gym split optimizer",
    title: "constraint-based scheduler",
    meta: "python · algorithms",
    roles: ["software & automation"],
    blurb: "graph-coloring workout scheduler with complexity analysis",
    detailLabel: "about the project",
    projects: [
      {
        name: "gym split optimizer",
        desc: "a scheduler that generates optimized weekly workout splits under availability and muscle-group recovery constraints. modeled recovery conflicts as a graph-coloring problem and solved with backtracking search plus a most-constrained-variable heuristic to prune the space; documented data-structure tradeoffs and complexity analysis in the readme.",
        learnings: ["graph coloring", "backtracking", "np-hard", "complexity analysis"],
      },
    ],
  },
  {
    id: "kotoflow",
    group: "projects",
    org: "kotoflow",
    title: "automation agent for non-technical workers",
    meta: "mistral hackathon, tokyo (dec 2025)",
    roles: ["ai & ml"],
    blurb: "fine-tuned llama-3-8b to turn conversations into automations",
    detailLabel: "the solution",
    introLabel: "the problem",
    intro: (
      <>
        big companies and organizations are <em>slooow</em> in adopting ai (so
        many opportunities to make processes more effective!), and most
        non-technical people (like your coworkers fred in accounting or amanda in
        hr) don&apos;t know how to squeeze the most out of it. they{" "}
        <em>might</em> be talking to a chatgpt or claude and <em>maybe</em> use it
        to write emails — but can&apos;t actually automate the tasks that are
        boring and repetitive.
      </>
    ),
    projects: [
      {
        desc: "it starts with a call between a worker — say arlene from accounting — and the ai bot. arlene talks through the tasks she finds most daunting and repetitive, and the bot listens, asking follow-up question after follow-up question to understand exactly what she needs and tailoring the automation as the conversation goes. those many rounds of follow-ups are the whole point: they're what make the result fit her needs precisely. once the bot has gathered everything, it generates a ready-to-use workflow that arlene can run right away.",
        stack: "fine-tuned llama-3-8b with qlora (4-bit quantization + lora adapters) via transformers / peft on a t4 gpu.",
        learnings: ["qlora", "fine-tuning", "pytorch", "agents"],
        media: { type: "youtube", src: "7jY0eB_O0vg", alt: "KotoFlow demo" },
        note: "built at a hackathon in tokyo — which is why some of the words are in japanese.",
        links: [
          { label: "watch the demo", href: "https://www.youtube.com/watch?v=7jY0eB_O0vg" },
          { label: "try it out", href: "https://mistral-hackathon-klara-koki.vercel.app/" },
        ],
      },
    ],
  },
  {
    id: "ai-consensus",
    group: "projects",
    org: "ai consensus",
    title: "hackathon lead · head of partnerships",
    meta: "2024",
    roles: ["leadership & gtm"],
    blurb: "led a 10-person team and raised $10k for a global hackathon",
    detailLabel: "what i led",
    projects: [
      {
        name: "global hackathon",
        desc: "led a 10-person team to run a global hackathon end-to-end, and — as head of partnerships — secured $10k in sponsorships from google & perplexity.",
        learnings: ["team leadership", "partnerships", "sponsorship", "event ops"],
      },
    ],
  },
  {
    id: "printive",
    group: "projects",
    org: "printive",
    title: "product team lead",
    meta: "",
    roles: ["product", "leadership & gtm"],
    blurb: "led product on sustainable 3d-printed running shoes",
    detailLabel: "what i shipped",
    projects: [
      {
        name: "sustainable footwear",
        desc: "led the product team designing sustainable 3d-printed running shoes with detachable soles, and partnered with modwall for distribution.",
        learnings: ["product ownership", "hardware", "sustainability", "partnerships"],
      },
    ],
  },
];

const ALL = [...EXPERIENCE, ...PROJECTS];

/* ── Detail panel ── */
const Detail = ({ item }: { item: Item }) => (
  <div>
    <p className="label-tag">{item.group === "experience" ? "experience" : "project"}</p>
    <h3 className="text-2xl font-bold mt-1">{item.org}</h3>
    <p className="text-sm text-muted-foreground mt-1">
      <span className="italic">{item.title}</span>
      {item.meta && <> · {item.meta}</>}
    </p>

    {item.intro && (
      <div className="mt-6">
        {item.introLabel && <p className="label-tag mb-2">{item.introLabel}</p>}
        <p className="text-[15px] text-muted-foreground leading-relaxed">{item.intro}</p>
      </div>
    )}

    <p className="label-tag mt-6 mb-4">{item.detailLabel}</p>

    <div className="space-y-7">
      {item.projects.map((p, i) => (
        <div key={p.name ?? i}>
          {p.name && <p className="text-[15px] font-semibold">{p.name}</p>}
          <p className={`text-[15px] text-muted-foreground leading-relaxed ${p.name ? "mt-1.5" : ""}`}>
            {p.desc}
          </p>

          {p.stack && (
            <p className="text-[15px] text-muted-foreground leading-relaxed mt-3">
              <span className="font-semibold text-foreground">stack: </span>
              {p.stack}
            </p>
          )}

          {p.note && (
            <p className="text-[13px] text-muted-foreground/80 italic mt-2">{p.note}</p>
          )}

          {p.media && (
            <div className="mt-4">
              <p className="label-tag mb-2">demo</p>
              {p.media.type === "youtube" ? (
                <div className="aspect-video w-full rounded-md border border-border overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${p.media.src}`}
                    title={p.media.alt}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : p.media.type === "video" ? (
                <video
                  src={getPublicUrl(p.media.src)}
                  controls
                  className="w-full rounded-md border border-border"
                />
              ) : (
                <img
                  src={getPublicUrl(p.media.src)}
                  alt={p.media.alt}
                  loading="lazy"
                  className="w-full rounded-md border border-border object-cover max-h-56"
                />
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="label-tag mr-1">learnings</span>
            {p.learnings.map((tag) => (
              <span
                key={tag}
                className="text-[11px] tracking-wide border border-border rounded-full px-2.5 py-0.5 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {p.href && (
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm story-link text-foreground"
            >
              see code →
            </a>
          )}

          {p.links && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm story-link text-foreground"
                >
                  {l.label} →
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ── List row ── */
const Row = ({
  item,
  active,
  opened,
  dimmed,
  onHover,
  onToggle,
}: {
  item: Item;
  active: boolean;
  opened: boolean;
  dimmed: boolean;
  onHover: () => void;
  onToggle: () => void;
}) => (
  <div className={dimmed ? "opacity-30 transition-opacity" : "transition-opacity"}>
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onToggle}
      className={`w-full text-left py-4 pl-4 -ml-4 border-l-2 transition-colors ${
        active
          ? "border-foreground"
          : "border-transparent hover:border-border"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="text-lg">
          <span className="font-semibold">{item.org}</span>{" "}
          <span className="text-muted-foreground italic text-base">· {item.title}</span>
        </h3>
        {item.meta && <span className="label-tag">{item.meta}</span>}
      </div>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.blurb}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {item.roles.map((r) => (
          <span
            key={r}
            className="text-[11px] tracking-wide border border-border rounded-full px-2.5 py-0.5 text-muted-foreground"
          >
            {r}
          </span>
        ))}
      </div>
    </button>

    {/* Inline detail — small screens tap to expand (the floating panel handles xl+) */}
    {opened && (
      <div className="xl:hidden mt-1 mb-4 pl-4 border-l-2 border-border">
        <Detail item={item} />
      </div>
    )}
  </div>
);

/* ── Page ── */
const Work = () => {
  const [hovered, setHovered] = useState<string>(""); // drives the floating panel (xl+)
  const [opened, setOpened] = useState<string>(""); // drives inline expand (below xl)
  const [activeFilters, setActiveFilters] = useState<Role[]>([]);

  const toggleFilter = (role: Role) =>
    setActiveFilters((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const matches = (roles: Role[]) =>
    activeFilters.length === 0 || roles.some((r) => activeFilters.includes(r));

  const hoveredItem = ALL.find((i) => i.id === hovered) ?? null;

  const renderList = (title: string, items: Item[]) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <Row
            key={item.id}
            item={item}
            active={hovered === item.id || opened === item.id}
            opened={opened === item.id}
            dimmed={!matches(item.roles)}
            onHover={() => setHovered(item.id)}
            onToggle={() => setOpened((cur) => (cur === item.id ? "" : item.id))}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="container flex-1 pt-6 md:pt-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">work + projects</h1>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          <span className="label-tag mr-1">filter by role:</span>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className="role-pill"
              data-active={activeFilters.includes(role)}
              onClick={() => toggleFilter(role)}
            >
              {role}
              {activeFilters.includes(role) && <span aria-hidden>×</span>}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="text-sm text-muted-foreground hover:text-foreground story-link ml-1"
            >
              clear all ×
            </button>
          )}
        </div>

        {/* Single-column list */}
        <div className="max-w-2xl">
          {renderList("experience", EXPERIENCE)}
          {renderList("projects", PROJECTS)}
          <p className="hidden xl:block text-xs text-muted-foreground mt-2">
            hover an item to see the details →
          </p>
        </div>

        {/* Floating detail panel — appears on hover (xl+) */}
        {hoveredItem && (
          <aside
            className="hidden xl:block fixed top-24 right-8 w-[370px]
              max-h-[calc(100vh-7rem)] overflow-auto z-40
              bg-background border border-border rounded-lg shadow-xl p-6"
          >
            <Detail item={hoveredItem} />
          </aside>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Work;
