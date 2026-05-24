import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getPublicUrl } from "@/lib/utils";
import { ExternalLink, Expand } from "lucide-react";

type Project = {
  title: string;
  short: string;       // label inside the circle
  category: string;
  desc: string;
  stack: string[];
  tags: string[];      // skills learned
  imageUrl: string;
  codeUrl: string;
  previewPdfUrl?: string;
  codePrivate?: boolean;
  pos: number;         // 0 = pure software, 100 = pure product management
};

const projects: Project[] = [
  {
    title: "Overdue Invoice Reminding Bot",
    short: "Invoice Bot",
    category: "Automation / Python",
    desc: "To decrease average invoice payment time, reduce outstanding overdue invoices, and minimize administrative hours spent on A/R follow-up. Integrated with Notion, Easybill, Slack and Telegram APIs.",
    stack: ["Python", "Notion API", "Easybill API", "Slack API", "Telegram API"],
    tags: ["API Integration", "Automation", "Backend", "Finance Systems"],
    imageUrl: "/slack%20bot%20preview.png",
    previewPdfUrl: "/slack%20bot%20demo%20canva.pdf",
    codeUrl: "https://github.com/klarakonkel/overdue-invoice-reminders.git",
    codePrivate: true,
    pos: 15,
  },
  {
    title: "Gmail Inbox Automation",
    short: "Inbox Auto",
    category: "Automation / n8n",
    desc: "Automated a finance department's inbox — classifying emails by intent, routing invoice submissions directly to accounting software, and auto-tagging from 900 client labels. Reduced manual work by 2 hours daily.",
    stack: ["n8n", "Gmail API", "Finance Integration"],
    tags: ["Workflow Design", "Process Optimisation", "Email Processing"],
    imageUrl: "/n8n inbox logic.png",
    codeUrl: "",
    codePrivate: true,
    pos: 35,
  },
  {
    title: "Context — Cultural Translation",
    short: "Context AI",
    category: "Product / AI",
    desc: "Real-time translation that picks up cultural cues during international calls. Analyzes tone and communication style to reveal implicit signals, giving real-time feedback to correct your approach and close more deals.",
    stack: ["React", "TypeScript", "Claude API"],
    tags: ["Product Strategy", "AI/ML", "Full-stack", "Cross-cultural Design"],
    imageUrl: "/context%20preview.png",
    codeUrl: "https://github.com/aokumo-yh/contextai",
    codePrivate: false,
    pos: 62,
  },
];

const ProjectImage = ({ project }: { project: Project }) => {
  const src = getPublicUrl(project.imageUrl);
  if (project.previewPdfUrl) {
    return (
      <Dialog>
        <DialogTrigger className="relative group w-full h-full cursor-pointer block">
          <img src={src} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
            <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto p-4 pb-2">
            <embed src={`${getPublicUrl(project.previewPdfUrl!)}#toolbar=1`} type="application/pdf"
              className="w-full min-h-[80vh] rounded border border-border" title={project.title} />
          </div>
          <div className="shrink-0 border-t bg-muted/30 px-4 py-2 rounded-b-lg">
            <a href={getPublicUrl(project.previewPdfUrl!)} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary hover:underline">Open in new tab</a>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog>
      <DialogTrigger className="relative group w-full h-full cursor-pointer block">
        <img src={src} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
          <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0">
        <img src={src} alt={project.title} className="w-full h-auto rounded" />
      </DialogContent>
    </Dialog>
  );
};

const Projects = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const active = projects.find((p) => p.title === selected) ?? null;

  return (
    <section id="projects">
      <p className="label-tag">Feature Stories</p>
      <h2 className="font-serif text-4xl font-bold mt-1 mb-3">Selected Work</h2>
      <p className="text-sm text-muted-foreground mb-10 max-w-prose">
        I believe that building transferable skills is essential to keep evolving
        personally and professionally. That&apos;s why I wear many hats:
      </p>

      {/* ── Spectrum ── */}
      <div>
        <div className="flex justify-between mb-3">
          <span className="label-tag">Software Engineering</span>
          <span className="label-tag">Product Management</span>
        </div>

        <div className="relative h-28 select-none">
          {/* Track */}
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-border" />

          {projects.map((p) => (
            <button
              key={p.title}
              onClick={() => setSelected(selected === p.title ? null : p.title)}
              style={{ left: `${p.pos}%` }}
              className={`
                absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                w-20 h-20 rounded-full border
                flex items-center justify-center
                transition-all duration-200 cursor-pointer
                ${selected === p.title
                  ? "bg-foreground text-background border-foreground scale-110 shadow-md"
                  : "bg-background border-border hover:border-foreground hover:scale-105"}
              `}
            >
              <span className="text-[9px] font-semibold leading-tight tracking-wide uppercase text-center px-2">
                {p.short}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      <div className={`overflow-hidden transition-all duration-300 ${active ? "max-h-[600px] opacity-100 mt-6" : "max-h-0 opacity-0"}`}>
        {active && (
          <div className="border-t border-border pt-6 flex flex-col md:flex-row gap-8">
            {/* Image */}
            <div className="md:w-[50%] shrink-0 aspect-[4/3] overflow-hidden bg-muted rounded-sm">
              {active.imageUrl
                ? <ProjectImage project={active} />
                : <div className="w-full h-full flex items-center justify-center"><span className="label-tag">Preview coming soon</span></div>
              }
            </div>
            {/* Text */}
            <div className="flex flex-col justify-center">
              <p className="label-tag">{active.category}</p>
              <h3 className="font-serif text-2xl font-bold mt-2 leading-snug">{active.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{active.desc}</p>
              <p className="mt-3 text-xs text-muted-foreground">{active.stack.join(" · ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.tags.map((tag) => (
                  <span key={tag} className="text-[10px] tracking-wide border border-border px-2.5 py-1 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                {active.codePrivate ? (
                  <Dialog>
                    <DialogTrigger className="editorial-btn">
                      <ExternalLink className="w-3.5 h-3.5" /> See Code
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <p className="text-sm text-muted-foreground">This project is private. Hit me up for a sanitized version!</p>
                    </DialogContent>
                  </Dialog>
                ) : active.codeUrl ? (
                  <a href={active.codeUrl} target="_blank" rel="noopener noreferrer" className="editorial-btn">
                    <ExternalLink className="w-3.5 h-3.5" /> See Code
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
