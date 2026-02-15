import { useState } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [open] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <a href="#home" className="flex flex-row items-center gap-2 text-lg font-semibold tracking-tight story-link" aria-label="Klara Konkel home">
          <span className="text-muted-foreground">Klara Konkel</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {s.label}
            </a>
          ))}
        </div>
        <div className="md:hidden" aria-hidden>
          {/* reserved for future mobile menu */}
          {open && null}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
