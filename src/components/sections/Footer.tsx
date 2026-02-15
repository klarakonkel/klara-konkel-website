import React from "react";

const Footer = () => {
  return (
    <footer className="container py-4 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Klara Konkel — Coffee-fueled, hybrid athlete energy.
    </footer>
  );
};

export default Footer;
