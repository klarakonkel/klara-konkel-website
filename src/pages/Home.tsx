import { useState, type ReactNode } from "react";
import Nav from "@/components/layout/Nav";
import SiteFooter from "@/components/layout/SiteFooter";
import { getPublicUrl } from "@/lib/utils";

const photo = getPublicUrl("/klara%20photo.jpg");

type Trait = {
  id: string;
  text: ReactNode;
  side: "left" | "right" | "bottom";
  x: number; // percent: `right` for left side, `left` for right side
  y: number; // percent from top
};

// Order here is also the mobile stacking order.
const traits: Trait[] = [
  { id: "minerva", side: "left", x: 52, y: 15, text: "a cs & business student at minerva university" },
  { id: "curious", side: "left", x: 74, y: 24, text: "a curious human" },
  { id: "sports", side: "left", x: 66, y: 33, text: "a hybrid sports addict (hyrox, weightlifting, running)" },
  { id: "coffee", side: "left", x: 78, y: 47, text: "a coffee enthusiast" },
  { id: "almedia", side: "left", x: 64, y: 57, text: "a working student at germany's 2nd bootstrapped unicorn" },
  { id: "explorer", side: "left", x: 80, y: 70, text: "a world explorer" },
  { id: "dancer", side: "left", x: 70, y: 78, text: "a dancer" },

  { id: "optimizing", side: "right", x: 63, y: 15, text: "obsessed with optimizing (systems, space, time, tasks so that they match my energy levels, workouts…)" },
  { id: "root", side: "right", x: 72, y: 40, text: "always getting to the root problem" },
  { id: "products", side: "right", x: 63, y: 50, text: "building products that respond to real needs" },
  { id: "math", side: "right", x: 68, y: 61, text: "sometimes geeking over math and programming" },
  { id: "planning", side: "right", x: 63, y: 72, text: "love planning" },
  { id: "aesthetics", side: "right", x: 67, y: 79, text: "have a strong sense of aesthetics" },

  {
    id: "countries",
    side: "bottom",
    x: 50,
    y: 88,
    text: (
      <>
        have lived and studied in the us, germany, japan, poland, and{" "}
        <em>soon</em> argentina
      </>
    ),
  },
];

const HEADLINE = "hi! i'm klara and i am …";
const LINKEDIN = "https://linkedin.com/in/klara-konkel";

const Home = () => {
  const [active, setActive] = useState<string | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Klara Konkel",
    description:
      "CS & Business student at Minerva University. Building at the intersection of software, AI, and product.",
    email: "mailto:klaraa.konkel@gmail.com",
    sameAs: ["https://linkedin.com/in/klara-konkel", "https://github.com/klarakonkel"],
  };

  const traitClass = (t: Trait) =>
    `text-[15px] leading-snug transition-colors cursor-pointer ${
      t.side === "left" ? "text-right" : t.side === "right" ? "text-left" : "text-center"
    } ${
      active === t.id
        ? "text-foreground underline underline-offset-4"
        : "text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="container flex-1">
        {/* ── Desktop: scattered cloud around the photo ── */}
        <div className="hidden lg:block relative mx-auto max-w-6xl h-[620px] xl:h-[680px] mt-4">
          <h1
            className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl font-bold tracking-tight whitespace-nowrap"
          >
            {HEADLINE}
          </h1>

          <img
            src={photo}
            alt="Klara Konkel"
            className="absolute left-1/2 -translate-x-1/2 w-auto rounded-sm object-contain shadow-sm"
            style={{ top: "24%", height: "52%" }}
          />

          {traits.map((t) => {
            const pos: React.CSSProperties =
              t.side === "left"
                ? { right: `${t.x}%` }
                : t.side === "right"
                ? { left: `${t.x}%` }
                : { left: "50%", transform: "translateX(-50%)" };
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive((cur) => (cur === t.id ? null : t.id))}
                className={`absolute ${traitClass(t)}`}
                style={{
                  top: `${t.y}%`,
                  maxWidth: t.side === "bottom" ? 420 : 230,
                  ...pos,
                }}
              >
                {t.text}
              </button>
            );
          })}
        </div>

        {/* Get in touch — desktop */}
        <div className="hidden lg:flex justify-center mt-2">
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm story-link text-foreground"
          >
            get in touch →
          </a>
        </div>

        {/* ── Mobile / tablet: stacked ── */}
        <div className="lg:hidden flex flex-col items-center text-center gap-7 pt-6 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{HEADLINE}</h1>
          <img
            src={photo}
            alt="Klara Konkel"
            className="w-[220px] rounded-sm object-contain shadow-sm"
          />
          <div className="flex flex-col items-center gap-3.5 max-w-sm">
            {traits.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive((cur) => (cur === t.id ? null : t.id))}
                className={`text-[15px] leading-snug text-center transition-colors cursor-pointer ${
                  active === t.id
                    ? "text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.text}
              </button>
            ))}
          </div>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm story-link text-foreground mt-2"
          >
            get in touch →
          </a>
        </div>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default Home;
