const roles = [
  {
    company: "Almedia",
    title: "Working Student — Finance Automations",
    details:
      "Built automation solutions including bots, API integrations, billing dashboard with real-time sync; developed full-stack a billing page for customers.",
  },
  {
    company: "AI Consensus",
    title: "Hackathon Lead & Head of Partnerships",
    details:
      "Led 10-person team for global hackathon, secured $10k sponsorships from Google & Perplexity.",
  },
  {
    company: "Printive",
    title: "Product Team Lead",
    details:
      "Designed sustainable 3D-printed running shoes with detachable soles, partnered with Modwall.",
  },
];

const Experience = () => {
  return (
    <section id="experience" className="container py-6 md:py-8">
      <h2 className="text-3xl font-bold tracking-tight">Experience</h2>
      <ol className="mt-8 relative border-l pl-6">
        {roles.map((r) => (
          <li key={r.company} className="mb-10 ml-2">
            <span className="absolute -left-2 mt-1 h-3 w-3 rounded-full bg-primary" />
            <p className="text-sm text-muted-foreground">{r.company}</p>
            <p className="font-medium">{r.title}</p>
            <p className="mt-1 text-muted-foreground">{r.details}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Experience;
