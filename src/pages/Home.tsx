import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/layout/Nav";
import SiteFooter from "@/components/layout/SiteFooter";
import AnimatedGlobe from "@/components/sections/AnimatedGlobe";
import { getPublicUrl } from "@/lib/utils";

const photo = getPublicUrl("/klara%20photo.jpg");

const Home = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Klara Konkel",
    description:
      "Building at the intersection of software, AI, and product. CS & Business @ Minerva University.",
    email: "mailto:klaraa.konkel@gmail.com",
    sameAs: [
      "https://linkedin.com/in/klara-konkel",
      "https://github.com/klarakonkel",
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="container flex-1">
        <div
          className="grid gap-x-14 gap-y-10 pt-6 md:pt-12
            grid-cols-1
            md:grid-cols-[190px_1fr]
            xl:grid-cols-[200px_minmax(0,1fr)_360px]"
        >
          {/* ── Left column ── */}
          <aside className="flex flex-col gap-6">
            {/* Photo — shown in full, background intact */}
            <img
              src={photo}
              alt="Klara Konkel"
              className="w-full max-w-[190px] rounded-md border border-border object-contain"
            />
          </aside>

          {/* ── Center content ── */}
          <section className="max-w-2xl xl:max-w-none md:pt-4">
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                now:{" "}
                <span className="text-foreground">financial systems engineer</span> @ almedia,{" "}
                <span className="text-foreground">cs &amp; business</span> @ minerva
              </p>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-[1.15] mb-6">
                building at the intersection of{" "}
                <span className="underline decoration-2 underline-offset-[6px]">software</span>,{" "}
                <span className="underline decoration-2 underline-offset-[6px]">ai</span> &amp;{" "}
                <span className="underline decoration-2 underline-offset-[6px]">product</span>.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-9">
                rising junior at minerva university, double-majoring in{" "}
                <span className="text-foreground">ai (cs)</span> and{" "}
                <span className="text-foreground">venture building (business)</span>. i build
                across finance automation, ai, and product — and study in a new country every
                year:{" "}
                <span className="whitespace-nowrap">🇩🇪 🇺🇸 🇯🇵 🇦🇷</span>
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/work" className="ghost-btn">
                  see my work <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:klaraa.konkel@gmail.com"
                  className="text-sm story-link text-foreground"
                >
                  get in touch →
                </a>
              </div>
            </section>

          {/* ── Globe — bottom-right accent ── */}
          <div
            className="flex justify-center md:justify-end md:col-span-2
              xl:col-span-1 xl:self-end xl:justify-self-end xl:-mb-4"
          >
            <div className="flex flex-col items-center">
              {/* Hint sits above the globe, not on it */}
              <p className="font-hand text-2xl md:text-[1.75rem] text-foreground/80 mb-1 text-center leading-tight">
                grab and drag to see where klara has lived!
              </p>
              <AnimatedGlobe
                showHint={false}
                className="w-[240px] md:w-[300px] xl:w-[360px] aspect-square"
              />
            </div>
          </div>
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
