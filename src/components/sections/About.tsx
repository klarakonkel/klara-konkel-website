const About = () => {
  return (
    <section id="about" className="container py-16 md:py-24">
      <div className="max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">About me</h2>
        <p className="text-muted-foreground">
          I’m a Computer Science & Business student at Minerva University, double majoring in CS (focus on AI) and Business (focus on Ventures). At my uni, I am studying in a different country (on a different continent!) every year — because in order to lead the world, you have to experience the world.
        </p>
        <p className="text-muted-foreground">
          In how I think, build, and lead, I am driven by my core values — independence, freedom, and ownership. I take initiative, move fast, and deliver measurable results, from scaling global events to deploying technical solutions in production. I enjoy building systems and products that solve real problems. Currently working on automations.
        </p>
      </div>
      <div className="mt-10">
        <div className="hidden md:block h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        <ol className="mt-8 grid gap-8 md:grid-cols-4">
          <li>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Sep 2024 →</span>
            </div>
            <p className="mt-2 font-medium">Minerva University</p>
          </li>
          <li>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Apr 2025</span>
            </div>
            <p className="mt-2 font-medium">AI Consensus Hackathon</p>
          </li>
          <li>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Oct 2024 – Apr 2025</span>
            </div>
            <p className="mt-2 font-medium">Printive — Sustainable Running Shoes</p>
          </li>
          <li>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Summer 2025</span>
            </div>
            <p className="mt-2 font-medium">Almedia — Finance Automation (Berlin)</p>
          </li>
        </ol>
      </div>
    </section>
  );
};

export default About;
