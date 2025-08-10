import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const placeholders = [
  { title: "Project One", desc: "Short description about the impact and what it does.", stack: ["React", "TypeScript"] },
  { title: "Project Two", desc: "Short description about the impact and what it does.", stack: ["Python", "FastAPI"] },
  { title: "Project Three", desc: "Short description about the impact and what it does.", stack: ["Automation", "APIs"] },
  { title: "Project Four", desc: "Short description about the impact and what it does.", stack: ["AI/ML", "Notebooks"] },
];

const Projects = () => {
  return (
    <section id="projects" className="container py-16 md:py-24">
      <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {placeholders.map((p) => (
          <Card key={p.title} className="hover-scale">
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full rounded-md bg-gradient-to-br from-muted to-accent/20" aria-hidden />
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Projects;
