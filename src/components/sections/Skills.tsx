const groups: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "Java", "C", "C++", "SQL", "Bash"] },
  { label: "Frameworks & Tools", items: ["React", "TypeScript", "APIs", "Git", "n8n", "Notion"] },
  { label: "Specialties", items: ["Automation", "AI / ML", "Full-stack", "Product ownership", "System design"] },
  { label: "Soft Skills", items: ["Stakeholder management", "Team leadership", "Cross-cultural collaboration", "Problem solving"] },
];

const Skills = () => (
  <section id="skills">
    <p className="label-tag">Capabilities</p>
    <h2 className="font-serif text-4xl font-bold mt-1 mb-8">Skills & Stack</h2>

    <div className="divide-y divide-border">
      {groups.map((g) => (
        <div key={g.label} className="py-6 flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0 mb-2 md:mb-0">
            <p className="label-tag">{g.label}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {g.items.join(" · ")}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default Skills;
