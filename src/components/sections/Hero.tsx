import { Button } from "@/components/ui/button";
import { getPublicUrl } from "@/lib/utils";
import { Github, Linkedin, Download } from "lucide-react";
import AnimatedGlobe from "./AnimatedGlobe";

const Hero = () => {
  return (
    <section id="home" className="container grid gap-10 py-6 md:py-8 lg:grid-cols-[1.6fr_1fr] items-start">
      <div className="flex flex-row gap-6 animate-fade-in">
        <img
          src={getPublicUrl("/klara%20photo.jpg")}
          alt="Klara Konkel"
          className="h-32 w-32 md:h-40 md:w-40 shrink-0 rounded-full object-cover border-2 border-border"
        />
        <div className="space-y-6 min-w-0">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Klara Konkel
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-prose">
          CS & Business @ Minerva University. Future Founder.
        </p>
        <div className="space-y-4 text-muted-foreground max-w-prose">
          <div>
            <p className="font-medium text-foreground">Double major:</p>
            <ul className="mt-1 ml-4 space-y-1">
              <li>• Computer Science and Artificial Intelligence</li>
              <li>• New Business Ventures</li>
            </ul>
          </div>
          <p>
            At my uni, I am studying in a different country (on a different continent!) every year, because in order to lead the world, you have to experience the world.
          </p>
          <p>
            In how I think, build, and lead, I am driven by my core values: independence, freedom, and ownership. I take initiative, move fast, and deliver measurable results, from scaling global events to deploying technical solutions in production. I enjoy building systems and products that solve real problems. Currently working on automations.
          </p>
        </div>
        </div>
      </div>
      <div className="animate-scale-in flex flex-col gap-6 -mt-4">
        <AnimatedGlobe />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <Button asChild variant="hero">
              <a href={getPublicUrl("/resume.pdf")} download>
                <Download className="mr-2" /> Download Resume
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://github.com/klarakonkel" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2" /> View GitHub
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="https://linkedin.com/in/klara-konkel" target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2" /> Connect on LinkedIn
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Rotating study/work cities: Berlin • San Francisco • Tokyo • Buenos Aires
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
