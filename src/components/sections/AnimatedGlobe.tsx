import React from "react";

interface PinProps {
  angle: number; // degrees
  label: string;
}

const Pin: React.FC<PinProps> = ({ angle, label }) => {
  const radius = 120; // px, controls pin distance from center
  const style: React.CSSProperties = {
    transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`
  };
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div style={style} className="relative">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[var(--shadow-glow)]"></span>
          <span className="text-xs text-muted-foreground select-none">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border shadow-[var(--shadow-elegant)]" />
      <div className="absolute inset-6 rounded-full border-2 border-dashed border-primary/30" />
      <div className="absolute inset-0 animate-spin-slow">
        {/* Approximate city positions around the orbit */}
        <Pin angle={20} label="Berlin" />
        <Pin angle={140} label="Tokyo" />
        <Pin angle={220} label="San Francisco" />
        <Pin angle={300} label="Buenos Aires" />
      </div>
      <div className="absolute inset-0 rounded-full pointer-events-none" aria-hidden />
    </div>
  );
};

export default AnimatedGlobe;
