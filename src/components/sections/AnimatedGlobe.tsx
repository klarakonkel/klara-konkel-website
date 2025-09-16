import React from "react";

interface CityPinProps {
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
}

const CityPin: React.FC<CityPinProps> = ({ x, y, label }) => {
  return (
    <div 
      className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="flex items-center gap-2 group">
        <div className="relative">
          <span className="h-3 w-3 rounded-full bg-accent shadow-[var(--shadow-glow)] border-2 border-white animate-pulse"></span>
          <span className="absolute inset-0 h-3 w-3 rounded-full bg-accent/30 animate-ping"></span>
        </div>
        <span className="text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
};

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
      {/* Globe base with Earth-like appearance */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 shadow-[var(--shadow-elegant)] overflow-hidden">
        {/* Continents overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/30 via-transparent to-green-600/20"></div>
        
        {/* Atmosphere glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-blue-300/20 to-transparent"></div>
        
        {/* Rotating container for cities */}
        <div className="absolute inset-0 animate-spin-slow">
          {/* City positions on the globe surface */}
          <CityPin x={70} y={35} label="Berlin" />
          <CityPin x={85} y={45} label="Tokyo" />
          <CityPin x={25} y={40} label="San Francisco" />
          <CityPin x={45} y={75} label="Buenos Aires" />
        </div>
        
        {/* Subtle grid lines for globe effect */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"></div>
        <div className="absolute inset-4 rounded-full border border-dashed border-white/10"></div>
      </div>
      
      {/* Outer glow effect */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-xl"></div>
    </div>
  );
};

export default AnimatedGlobe;
