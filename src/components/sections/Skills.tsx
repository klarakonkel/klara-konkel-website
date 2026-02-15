import { Badge } from "@/components/ui/badge";
import { Cpu, Code2, Brain, Workflow, Rocket } from "lucide-react";

const skills = {
  Languages: ["Java", "Python", "C", "C++", "SQL", "Bash"],
  "Frameworks & Tools": ["React", "APIs", "Git", "Notion"],
  Specialties: [
    "Automation",
    "AI/ML development",
    "Full‑stack web apps",
    "Product ownership",
    "System optimization",
  ],
  "Soft Skills": [
    "Stakeholder management",
    "Team leadership",
    "Cross‑cultural collaboration",
    "Communication",
    "Problem solving",
  ],
} as const;

const Skills = () => {
  return (
    <section id="skills" className="container py-6 md:py-8">
      <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Badge key={item} variant="secondary" className="hover-scale">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-5 items-center gap-6 text-muted-foreground">
        <Cpu className="mx-auto" />
        <Code2 className="mx-auto" />
        <Brain className="mx-auto" />
        <Workflow className="mx-auto" />
        <Rocket className="mx-auto" />
      </div>
    </section>
  );
};

export default Skills;
