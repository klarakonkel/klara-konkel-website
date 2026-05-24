import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:klaraa.konkel@gmail.com?subject=Portfolio%20Contact&body=${body}`;
  };

  return (
    <section id="contact">
      <p className="label-tag">Get in Touch</p>
      <h2 className="font-serif text-4xl font-bold mt-1 mb-2">Let's build something.</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-8 text-sm text-muted-foreground">
        <a className="story-link" href="mailto:klaraa.konkel@gmail.com">klaraa.konkel@gmail.com</a>
        <span className="hidden md:inline text-border">·</span>
        <a className="story-link" href="https://linkedin.com/in/klara-konkel" target="_blank" rel="noreferrer">LinkedIn</a>
        <span className="hidden md:inline text-border">·</span>
        <a className="story-link" href="https://github.com/klarakonkel" target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="name" className="label-tag block mb-1.5">Name</label>
          <Input id="name" name="name" required placeholder="Your name" className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground" />
        </div>
        <div>
          <label htmlFor="email" className="label-tag block mb-1.5">Email</label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground" />
        </div>
        <div>
          <label htmlFor="message" className="label-tag block mb-1.5">Message</label>
          <Textarea id="message" name="message" required placeholder="What shall we build?" rows={4} className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-foreground resize-none" />
        </div>
        <Button type="submit" className="editorial-btn mt-2" variant="outline">
          Send →
        </Button>
      </form>
    </section>
  );
};

export default Contact;
