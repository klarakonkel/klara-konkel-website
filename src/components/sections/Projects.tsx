import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getPublicUrl } from "@/lib/utils";
import { ExternalLink, Expand } from "lucide-react";

type Project = {
  title: string;
  category: string;
  desc: string;
  stack: string[];
  imageUrl: string;
  codeUrl: string;
  previewPdfUrl?: string;
  codePrivate?: boolean;
};

const projects: Project[] = [
  {
    title: "Overdue Invoice Reminding Bot",
    category: "Automation / Python",
    desc: "To decrease average invoice payment time, reduce outstanding overdue invoices, and minimize administrative hours spent on A/R follow-up. Integrated with Notion, Easybill, Slack and Telegram APIs.",
    stack: ["Python", "Notion API", "Easybill API", "Slack API", "Telegram API"],
    imageUrl: "/slack%20bot%20preview.png",
    previewPdfUrl: "/slack%20bot%20demo%20canva.pdf",
    codeUrl: "https://github.com/klarakonkel/overdue-invoice-reminders.git",
    codePrivate: true,
  },
  {
    title: "Gmail Inbox Automation",
    category: "Automation / n8n",
    desc: "Automated a finance department's inbox — classifying emails by intent, routing invoice submissions directly to accounting software, and auto-tagging from 900 client labels. Reduced manual work by 2 hours daily.",
    stack: ["n8n", "Gmail API", "Finance Integration"],
    imageUrl: "/n8n inbox logic.png",
    codeUrl: "",
    codePrivate: true,
  },
  {
    title: "Context — Cultural Translation",
    category: "Product / AI",
    desc: "Real-time translation that picks up cultural cues during international calls. Analyzes tone and communication style to reveal implicit signals, giving real-time feedback to correct your approach and close more deals.",
    stack: ["React", "TypeScript", "Claude API"],
    imageUrl: "/context%20preview.png",
    codeUrl: "https://github.com/aokumo-yh/contextai",
    codePrivate: false,
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
            <embed
              src={`${getPublicUrl(project.previewPdfUrl!)}#toolbar=1`}
              type="application/pdf"
              className="w-full min-h-[80vh] rounded border border-border"
              title={project.title}
            />
          </div>
          <div className="shrink-0 border-t bg-muted/30 px-4 py-2 rounded-b-lg">
            <a href={getPublicUrl(project.previewPdfUrl!)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Open in new tab
            </a>
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

const Projects = () => (
  <section id="projects">
    <p className="label-tag">Feature Stories</p>
    <h2 className="font-serif text-4xl font-bold mt-1 mb-3">Selected Work</h2>
    <p className="text-sm text-muted-foreground mb-8 max-w-prose">
      I believe that building transferable skills is essential to keep evolving
      personally and professionally. That&apos;s why I wear many hats:
    </p>

    <div className="divide-y divide-border">
      {projects.map((p) => (
        <article key={p.title} className="py-10 flex flex-col md:flex-row gap-8">
          {/* Image */}
          <div className="md:w-[55%] shrink-0 aspect-[4/3] overflow-hidden bg-muted rounded-sm">
            {p.imageUrl ? (
              <ProjectImage project={p} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="label-tag">Preview coming soon</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="label-tag">{p.category}</p>
            <h3 className="font-serif text-2xl font-bold mt-2 leading-snug">{p.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            <p className="mt-3 text-xs text-muted-foreground">{p.stack.join(" · ")}</p>
            <div className="mt-5">
              {p.codePrivate ? (
                <Dialog>
                  <DialogTrigger className="editorial-btn">
                    <ExternalLink className="w-3.5 h-3.5" /> See Code
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <p className="text-sm text-muted-foreground">This project is private. Hit me up for a sanitized version!</p>
                  </DialogContent>
                </Dialog>
              ) : p.codeUrl ? (
                <a href={p.codeUrl} target="_blank" rel="noopener noreferrer" className="editorial-btn">
                  <ExternalLink className="w-3.5 h-3.5" /> See Code
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Projects;
