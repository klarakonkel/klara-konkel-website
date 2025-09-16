import React from "react";
import worldMap from "@/assets/world-map.png";

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
          <span className="h-3 w-3 rounded-full bg-red-500 shadow-lg border-2 border-white animate-pulse"></span>
          <span className="absolute inset-0 h-3 w-3 rounded-full bg-red-500/50 animate-ping"></span>
        </div>
        <span className="text-xs font-medium text-white bg-black/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
};

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
      {/* Globe base with actual Earth map */}
      <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-blue-500">
        {/* World map image */}
        <div className="absolute inset-0 animate-spin-earth">
          <img 
            src={worldMap} 
            alt="World Map" 
            className="w-full h-full object-cover rounded-full"
          />
          
          {/* City markers on top of the map */}
          <CityPin x={56} y={30} label="Berlin" />
          <CityPin x={87} y={38} label="Tokyo" />
          <CityPin x={18} y={42} label="San Francisco" />
          <CityPin x={40} y={70} label="Buenos Aires" />
        </div>
        
        {/* Atmospheric glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-transparent to-blue-600/20 pointer-events-none"></div>
        
        {/* Subtle highlight on the sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
      </div>
      
      {/* Outer atmospheric glow */}
      <div className="absolute -inset-1 rounded-full bg-blue-400/30 blur-md"></div>
    </div>
  );
};

export default AnimatedGlobe;
