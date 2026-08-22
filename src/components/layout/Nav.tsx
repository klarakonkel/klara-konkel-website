import { NavLink } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { to: "/", label: "about me", end: true },
  { to: "/work", label: "work + projects", end: false },
];

const Tabs = ({ className = "" }: { className?: string }) => (
  <nav className={`flex items-center justify-center gap-6 ${className}`}>
    {links.map((l) => (
      <NavLink
        key={l.to}
        to={l.to}
        end={l.end}
        className={({ isActive }) =>
          `text-sm whitespace-nowrap transition-colors ${
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
);

const Nav = () => (
  <header className="container py-6">
    <div className="flex items-center justify-between gap-4">
      {/* Wordmark */}
      <NavLink
        to="/"
        className="text-base font-semibold tracking-tight whitespace-nowrap shrink-0"
      >
        klara konkel
      </NavLink>

      {/* Center tabs — inline on sm+ */}
      <Tabs className="hidden sm:flex flex-1" />

      {/* Theme toggle */}
      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </div>

    {/* Center tabs — second row on mobile */}
    <Tabs className="sm:hidden mt-5" />
  </header>
);

export default Nav;
