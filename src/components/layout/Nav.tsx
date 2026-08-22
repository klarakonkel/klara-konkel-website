import { NavLink } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { to: "/", label: "about", end: true },
  { to: "/work", label: "work", end: false },
];

const Nav = () => (
  <header className="container flex items-center py-6">
    {/* Wordmark */}
    <NavLink to="/" className="text-base font-semibold tracking-tight shrink-0">
      klara konkel
    </NavLink>

    {/* Center tabs */}
    <nav className="flex-1 flex items-center justify-center gap-7">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            `text-sm transition-colors ${
              isActive
                ? "text-foreground underline underline-offset-4"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>

    {/* Theme toggle */}
    <div className="shrink-0">
      <ThemeToggle />
    </div>
  </header>
);

export default Nav;
