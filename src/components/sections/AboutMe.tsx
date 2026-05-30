const AboutMe = () => (
  <section id="about">
    <p className="label-tag">About</p>
    <h2 className="font-serif text-4xl font-bold mt-1 mb-6">About Me</h2>

    <p className="text-sm text-muted-foreground leading-relaxed max-w-prose mb-12">
      I'm currently pursuing my bachelor's degree at Minerva University, double-majoring in
      Software Engineering and AI (Computer Science College) and Venture Building (Business College).
    </p>

    <div className="divide-y divide-border">

      {/* My Studies */}
      <div className="py-8">
        <p className="label-tag mb-3">My Studies</p>
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0 mb-4 md:mb-0">
            <a
              href="https://www.minerva.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-base font-bold story-link"
            >
              Minerva University
            </a>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
            <p>
              Minerva is an innovative institution built around active learning. Instead of traditional
              lectures, it uses a flipped classroom model — students prepare independently, then come
              to class ready to apply concepts through real-world problem solving, small projects, and
              case analysis.
            </p>
            <p>
              Each academic year is spent in a different country (on a different continent), where we
              collaborate with local start-ups, NGOs, and organisations to tackle both global and local
              challenges.
            </p>
            <p>
              Minerva has been ranked the{" "}
              <span className="text-foreground font-medium">
                #1 Most Innovative University in the World
              </span>{" "}
              (WURI, 2022–2025), and is among the most selective universities globally, with an
              acceptance rate of ~2%.
            </p>
          </div>
        </div>
      </div>

      {/* My Approach to Work */}
      <div className="py-8">
        <p className="label-tag mb-3">My Approach to Work</p>
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0" />
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
            <p>
              I believe that building transferable skills is essential to keep evolving personally
              and professionally. That's why I wear many hats.
            </p>
            <p>
              My projects span the spectrum from pure software engineering to product management —{" "}
              <a href="#projects" className="story-link text-foreground font-medium">
                see the matrix
              </a>{" "}
              to explore where each one lands, and what I learned from it.
            </p>
          </div>
        </div>
      </div>

      {/* My Interests */}
      <div className="py-8">
        <p className="label-tag mb-3">My Interests</p>
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0" />
          <p className="text-sm text-muted-foreground italic">Coming soon.</p>
        </div>
      </div>

      {/* My Thoughts */}
      <div className="py-8">
        <p className="label-tag mb-3">My Thoughts</p>
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="md:w-[140px] shrink-0 mb-2 md:mb-0">
            <span className="text-xs text-muted-foreground">Medium articles</span>
          </div>
          <p className="text-sm text-muted-foreground italic">Coming soon.</p>
        </div>
      </div>

    </div>
  </section>
);

export default AboutMe;
