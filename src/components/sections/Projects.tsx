import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Expand, ChevronLeft, ChevronRight } from "lucide-react";

type Project = {
  title: string;
  desc: string;
  stack: string[];
  videoUrl: string;
  imageUrl: string;
  codeUrl: string;
  previewPdfUrl?: string;
};

const projects: Project[] = [
  {
    title: "Overdue Invoice Reminding Bot",
    desc: "To decrease the average invoice payment time, reduce the number of outstanding overdue invoices, and minimize the administrative hours spent on A/R follow-up.",
    stack: ["Python", "Notion API", "Easybill API", "Slack API", "Telegram API", "Automation"],
    videoUrl: "",
    imageUrl: "/slack%20bot%20preview.png",
    previewPdfUrl: "/slack%20bot%20demo%20canva.pdf",
    codeUrl: "https://github.com/klarakonkel/overdue-invoice-reminders.git"
  },
  {
    title: "Gmail Inbox Automation",
    desc: "Built a workflow to automate a finance department's inbox, classifying emails by intent (requiring human reaction, informative only, or invoice submissions). Integrated invoice submissions with accounting software for direct processing. Implemented auto-tagging with one of 900 client labels. Reduced manual work by 2 hours daily.",
    stack: ["n8n", "Gmail API", "Automation", "Email Processing", "Finance Integration"],
    videoUrl: "",
    imageUrl: "/n8n inbox logic.png",
    codeUrl: "https://github.com/yourusername/gmail-inbox-automation"
  },
  {
    title: "Context - cultural translation",
    desc: "Real-time translation that picks up cultural cues during international calls, allowing you to understand not just what is said, but what is meant. Analyzes tone and communication style to reveal implicit signals in conversations, and gives you real-time feedback to correct your approach and close more deals.",
    stack: ["React", "TypeScript", "Claude API", "Translation", "Cultural AI"],
    videoUrl: "",
    imageUrl: "/context%20preview.png",
    codeUrl: "https://github.com/aokumo-yh/contextai"
  },
];

const renderProjectPreview = (project: Project) => {
  if (project.videoUrl) {
    return (
      <video className="w-full h-full object-cover" controls preload="metadata" poster="">
        <source src={project.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
  if (project.imageUrl && project.previewPdfUrl) {
    return (
      <Dialog>
        <DialogTrigger className="relative group w-full h-full cursor-pointer">
          <img src={project.imageUrl} alt={`${project.title} preview`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto p-4 pb-2">
            <embed src={`${project.previewPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" className="w-full min-h-[80vh] rounded-lg border border-border" title={`${project.title} preview`} />
          </div>
          <div className="shrink-0 border-t bg-muted/30 px-4 py-2 rounded-b-lg">
            <a href={project.previewPdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open in new tab (if preview doesn’t load)</a>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (project.imageUrl) {
    return (
      <Dialog>
        <DialogTrigger className="relative group w-full h-full cursor-pointer">
          <img src={project.imageUrl} alt={`${project.title} diagram`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full p-0">
          <img src={project.imageUrl} alt={`${project.title} diagram`} className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>
    );
  }
  if (project.previewPdfUrl) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="flex items-center justify-center h-full w-full bg-gradient-to-br from-muted to-accent/20 hover:from-muted/90 hover:to-accent/30 transition-colors cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <span className="text-muted-foreground text-sm hover:text-foreground">Slack bot ppt</span>
        </button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto p-4 pb-2">
            <embed src={`${project.previewPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" className="w-full min-h-[80vh] rounded-lg border border-border" title={`${project.title} preview`} />
          </div>
          <div className="shrink-0 border-t bg-muted/30 px-4 py-2 rounded-b-lg">
            <a href={project.previewPdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open in new tab (if preview doesn’t load)</a>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-accent/20">
      <span className="text-muted-foreground text-sm">Demo coming soon</span>
    </div>
  );
};

const SideCard = ({ project }: { project: Project }) => (
  <Card className="pointer-events-none scale-90 opacity-50 blur-sm transition-all duration-300 ease-out hover-scale min-w-0 overflow-hidden">
    <CardHeader className="pb-1">
      <CardTitle className="text-base truncate">{project.title}</CardTitle>
      <CardDescription className="line-clamp-2 text-xs">{project.desc}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/20">
            <span className="text-muted-foreground text-xs">Preview</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {project.stack.slice(0, 2).map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const goPrev = () => {
    setDirection("left");
    setCurrentIndex((i) => (i === 0 ? projects.length - 1 : i - 1));
  };
  const goNext = () => {
    setDirection("right");
    setCurrentIndex((i) => (i === projects.length - 1 ? 0 : i + 1));
  };
  const leftProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const centerProject = projects[currentIndex];
  const rightProject = projects[(currentIndex + 1) % projects.length];

  return (
    <section id="projects" className="container py-6 md:py-8">
      <h2 className="text-3xl font-bold tracking-tight">Check out my projects</h2>
      <div className="mt-6 flex items-center gap-2 max-w-5xl mx-auto">
        <Button variant="outline" size="icon" onClick={goPrev} className="shrink-0 h-10 w-10" aria-label="Previous project">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-stretch gap-1 min-w-0 overflow-hidden">
          <div className="w-[20%] min-w-0 shrink-0 flex items-stretch transition-[flex] duration-300 ease-out">
            <SideCard project={leftProject} />
          </div>
          <div className="w-[60%] min-w-0 shrink-0 px-1 transition-all duration-300 ease-out overflow-hidden">
            <Card
              key={centerProject.title}
              className={`hover-scale overflow-hidden ring-2 ring-primary/30 transition-all duration-300 ease-out ${
                direction === "right" ? "animate-in slide-in-from-right-8 fade-in duration-300" : "animate-in slide-in-from-left-8 fade-in duration-300"
              }`}
            >
              <CardHeader>
                <CardTitle>{centerProject.title}</CardTitle>
                <CardDescription>{centerProject.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                  {renderProjectPreview(centerProject)}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    {centerProject.stack.map((tech) => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(centerProject.codeUrl, "_blank")} className="shrink-0">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    See Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-[20%] min-w-0 shrink-0 flex items-stretch transition-[flex] duration-300 ease-out">
            <SideCard project={rightProject} />
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={goNext} className="shrink-0 h-10 w-10" aria-label="Next project">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default Projects;
