import AnimatedGlobe from "@/components/sections/AnimatedGlobe";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import AboutMe from "@/components/sections/AboutMe";
import Footer from "@/components/sections/Footer";
import { getPublicUrl } from "@/lib/utils";
import { Github, Linkedin, Mail } from "lucide-react";

const coordinates = [
  { dates: "2027 — 2028", city: "San Francisco, CA", note: "upcoming" },
  { dates: "2026 — 2027", city: "Buenos Aires, AR",  note: "" },
  { dates: "2025 — 2026", city: "Tokyo, JP",          note: "" },
  { dates: "2024 — 2025", city: "San Francisco, CA",  note: "" },
  { dates: "2023 — 2024", city: "Berlin, DE",          note: "" },
];

const dispatch = [
  { href: "#projects",   label: "Selected Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills",     label: "Skills & Stack" },
  { href: "#about",      label: "About Me" },
];

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Klara Konkel",
    description: "Future founder. Software & AI Developer. CS & Business @ Minerva University.",
    email: "mailto:klaraa.konkel@gmail.com",
    sameAs: [
      "https://linkedin.com/in/klara-konkel",
      "https://github.com/klarakonkel",
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Masthead ── */}
      <header className="container border-b border-border py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight leading-none">
              Klara Konkel
            </h1>
            <p className="label-tag mt-2.5">
              Rising junior at Minerva University — double major in Artificial Intelligence (CS) and Venture Building (business)
            </p>
          </div>
          <p className="hidden md:block max-w-[210px] text-right font-serif font-bold text-sm leading-snug mt-1">
            Software Engineering &amp; Product Management.<br />
            Building technical solutions<br />
            through a human-centric lens.
          </p>
        </div>
      </header>

      {/* ── Two-column body ── */}
      <div className="container flex gap-12 py-10 items-start">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[170px] lg:w-[210px] shrink-0 sticky top-8 self-start gap-8">

          {/* Dispatch index — top of sidebar */}
          <div>
            <p className="label-tag">Dispatch Index</p>
            <hr className="mt-2 mb-4 border-border" />
            <nav className="space-y-2.5">
              {dispatch.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {d.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="label-tag">Contact</p>
            <hr className="mt-2 mb-4 border-border" />
            <div className="space-y-2">
            <a href="mailto:klaraa.konkel@gmail.com"
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5 shrink-0" /> klaraa.konkel@gmail.com
            </a>
            <a href="https://linkedin.com/in/klara-konkel" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-3.5 h-3.5 shrink-0" /> klara-konkel
            </a>
            <a href="https://github.com/klarakonkel" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-3.5 h-3.5 shrink-0" /> klarakonkel
            </a>
            </div>
          </div>

          {/* Globe */}
          <AnimatedGlobe />

          <a href="#about" className="text-xs text-muted-foreground hover:text-foreground transition-colors italic -mt-4">
            Why is Klara moving so much?
          </a>

          {/* Current coordinates */}
          <div>
            <p className="label-tag">Current Coordinates</p>
            <hr className="mt-2 mb-4 border-border" />
            <div className="space-y-4">
              {coordinates.map((c) => (
                <div key={c.dates}>
                  <p className="text-[10px] text-muted-foreground">
                    {c.dates}{c.note ? ` · ${c.note}` : ""}
                  </p>
                  <p className="text-sm font-medium mt-0.5">{c.city}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resume */}
          <a href={getPublicUrl("/resume.pdf")} download className="editorial-btn justify-center">
            ↓ &nbsp;Resume
          </a>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-20">
          <Experience />
          <Projects />
          <Skills />
          <AboutMe />
        </main>
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default Index;
