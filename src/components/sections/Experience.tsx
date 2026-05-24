const roles = [
  {
    company: "Almedia",
    category: "Working Student",
    title: "Finance Automations",
    details: "Built automation solutions including bots, API integrations, a billing dashboard with real-time sync, and a full-stack billing page for customers.",
  },
  {
    company: "AI Consensus",
    category: "Leadership",
    title: "Hackathon Lead & Head of Partnerships",
    details: "Led 10-person team for a global hackathon. Secured $10k in sponsorships from Google & Perplexity.",
  },
  {
    company: "Printive",
    category: "Product",
    title: "Product Team Lead",
    details: "Designed sustainable 3D-printed running shoes with detachable soles. Partnered with Modwall for distribution.",
  },
];

const Experience = () => (
  <section id="experience">
    <p className="label-tag">Field Notes</p>
    <h2 className="font-serif text-4xl font-bold mt-1 mb-8">Experience</h2>

    <div className="divide-y divide-border">
      {roles.map((r) => (
        <div key={r.company} className="py-8 flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0 mb-2 md:mb-0">
            <p className="label-tag">{r.category}</p>
            <p className="text-sm font-semibold mt-1">{r.company}</p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold leading-snug">{r.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.details}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Experience;
