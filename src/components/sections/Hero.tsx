import { Button } from "@/components/ui/button";
import { Github, Linkedin, Download } from "lucide-react";
import AnimatedGlobe from "./AnimatedGlobe";

const Hero = () => {
  return (
    <section id="home" className="container grid gap-10 py-16 md:py-24 lg:grid-cols-2 items-center">
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Klara Konkel
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-prose">
          Future founder. Software & AI Developer. Outcome-focused CS & Business student @ Minerva University.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero">
            <a href="/resume.pdf" download>
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
      <div className="animate-scale-in">
        <AnimatedGlobe />
      </div>
    </section>
  );
};

export default Hero;
