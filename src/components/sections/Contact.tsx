import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import worldMap from "@/assets/world-map.png";

const Contact = () => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const body = encodeURIComponent(`From: ${name} <${email}>
\n${message}`);
    window.location.href = `mailto:klaraa.konkel@gmail.com?subject=Portfolio%20Contact&body=${body}`;
  };

  return (
    <section id="contact" className="container py-6 md:py-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">Let’s build something impactful together.</h2>
        <p className="mt-2 text-muted-foreground">
          Email: <a className="story-link" href="mailto:klaraa.konkel@gmail.com">klaraa.konkel@gmail.com</a>
        </p>
        <p className="text-muted-foreground">
          LinkedIn: <a className="story-link" href="https://linkedin.com/in/klara-konkel" target="_blank" rel="noreferrer">linkedin.com/in/klara-konkel</a>
        </p>
        <p className="text-muted-foreground">
          GitHub: <a className="story-link" href="https://github.com/klarakonkel" target="_blank" rel="noreferrer">github.com/klarakonkel</a>
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm text-muted-foreground">Name</label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="message" className="text-sm text-muted-foreground">Message</label>
            <Textarea id="message" name="message" required placeholder="What shall we build?" rows={5} />
          </div>
          <Button type="submit" variant="hero">Send</Button>
        </form>

        <div className="relative overflow-hidden rounded-lg border bg-card">
          <img src={worldMap} alt="Minimal world map for contact — based in San Francisco, working globally" loading="lazy" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[18%] top-[35%] h-3 w-3 rounded-full bg-accent shadow-[var(--shadow-glow)]" title="San Francisco" />
          </div>
          <p className="p-4 text-sm text-muted-foreground">
            Based in <span className="line-through">San Francisco</span>, working globally.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
