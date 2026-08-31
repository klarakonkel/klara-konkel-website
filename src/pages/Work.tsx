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
        media: { type: "image", src: "/slack%20bot%20preview.png", alt: "overdue-invoice Slack bot" },
      },
      {
        name: "ml reconciliation engine — in progress",
        desc: "building an invoice-payment reconciliation engine: a deterministic candidate generator (subset-sum for many-to-many matches) feeds a gradient-boosted ranker (lightgbm) whose calibrated probabilities drive a confidence-thresholded decision — auto-confirming high-precision matches and routing ambiguous cases to human review.",
        learnings: ["lightgbm", "calibration", "precision@threshold", "subset-sum"],
      },
    ],
  },
  {
    id: "ai-consensus",
    group: "experience",
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
    group: "experience",
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

const PROJECTS: Item[] = [
  {
    id: "context",
    group: "projects",
    org: "context",
    title: "real-time cultural translation",
    meta: "react · typescript · claude api",
    roles: ["product", "ai & ml"],
    blurb: "surfaces implicit cultural cues during international calls",
    detailLabel: "about the project",
    projects: [
      {
        name: "context",
        desc: "real-time translation that picks up cultural cues during international calls — analyzing tone and communication style to reveal implicit signals and giving live feedback to adjust your approach and close more deals.",
        learnings: ["product strategy", "llm apps", "real-time ux", "cross-cultural design"],
        media: { type: "image", src: "/context%20preview.png", alt: "Context preview" },
        href: "https://github.com/aokumo-yh/contextai",
      },
    ],
  },
  {
    id: "gmail-inbox",
    group: "projects",
    org: "gmail inbox automation",
    title: "intent-based email routing",
    meta: "n8n · gmail api",
    roles: ["software & automation", "ai & ml"],
    blurb: "classifies and routes a finance inbox, saving ~2 hrs/day",
    detailLabel: "about the project",
    projects: [
      {
        name: "gmail inbox automation",
        desc: "automated a finance department's inbox — classifying emails by intent, routing invoice submissions straight to accounting software, and auto-tagging from 900 client labels. cut ~2 hours of manual work per day.",
        learnings: ["workflow design", "email classification", "process optimization"],
        media: { type: "image", src: "/n8n%20inbox%20logic.png", alt: "n8n inbox logic" },
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
          {p.media &&
            (p.media.type === "youtube" ? (
              <div className="aspect-video w-full rounded-md border border-border overflow-hidden mb-3">
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
                className="w-full rounded-md border border-border mb-3"
              />
            ) : (
              <img
                src={getPublicUrl(p.media.src)}
                alt={p.media.alt}
                loading="lazy"
                className="w-full rounded-md border border-border mb-3 object-cover max-h-56"
              />
            ))}

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

/* ── Left-hand row ── */
const Row = ({
  item,
  active,
  dimmed,
  onActivate,
  onToggle,
}: {
  item: Item;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onToggle: () => void;
}) => (
  <div className={dimmed ? "opacity-30 transition-opacity" : "transition-opacity"}>
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
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

    {/* Inline detail on small screens */}
    {active && (
      <div className="lg:hidden mt-1 mb-4 pl-4 border-l-2 border-border">
        <Detail item={item} />
      </div>
    )}
  </div>
);

/* ── Page ── */
const Work = () => {
  const [active, setActive] = useState<string>("almedia");
  const [activeFilters, setActiveFilters] = useState<Role[]>([]);

  const toggleFilter = (role: Role) =>
    setActiveFilters((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const matches = (roles: Role[]) =>
    activeFilters.length === 0 || roles.some((r) => activeFilters.includes(r));

  const activeItem = ALL.find((i) => i.id === active) ?? null;

  const renderList = (title: string, items: Item[]) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <Row
            key={item.id}
            item={item}
            active={active === item.id}
            dimmed={!matches(item.roles)}
            onActivate={() => setActive(item.id)}
            onToggle={() => setActive((cur) => (cur === item.id ? "" : item.id))}
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

        {/* Master / detail */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-14">
          {/* Left: lists */}
          <div>
            {renderList("experience", EXPERIENCE)}
            {renderList("projects", PROJECTS)}
            <p className="hidden lg:block text-xs text-muted-foreground mt-4">
              hover an item to preview it →
            </p>
          </div>

          {/* Right: sticky detail (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-8 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
              {activeItem ? (
                <Detail item={activeItem} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  hover an experience or project to see the details.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Work;
