import { getPublicUrl } from "@/lib/utils";

const socials = [
  { label: "linkedin", href: "https://linkedin.com/in/klara-konkel", external: true },
  { label: "github", href: "https://github.com/klarakonkel", external: true },
  { label: "email", href: "mailto:klaraa.konkel@gmail.com", external: false },
  { label: "résumé", href: getPublicUrl("/resume.pdf"), external: true },
];

const SiteFooter = () => (
  <footer className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 mt-16">
    <span className="text-sm text-muted-foreground">
      designed + built with{" "}
      <span className="text-foreground">&lt;3</span> by klara
    </span>

    <nav className="flex flex-wrap items-center gap-5">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target={s.external ? "_blank" : undefined}
          rel={s.external ? "noopener noreferrer" : undefined}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {s.label}
        </a>
      ))}
    </nav>
  </footer>
);

export default SiteFooter;
