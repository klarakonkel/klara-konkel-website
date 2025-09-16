import React from "react";
import worldMap from "@/assets/world-map.png";

interface CityPinProps {
  x: number; // 0-100 across a single map copy
  y: number; // 0-100 top to bottom
  label: string;
  offsetPct?: number; // 0 for first copy, 50 for second
}

const CityPin: React.FC<CityPinProps> = ({ x, y, label, offsetPct = 0 }) => (
  <div
    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${offsetPct + x / 2}%`, top: `${y}%` }}
  >
    <div className="flex items-center gap-2 group">
      <div className="relative">
        <span className="h-3 w-3 rounded-full bg-accent border-2 border-background shadow-[var(--shadow-glow)] animate-pulse"></span>
        <span className="absolute inset-0 h-3 w-3 rounded-full bg-accent/40 animate-ping"></span>
      </div>
      <span className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {label}
      </span>
    </div>
  </div>
);

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96">
      <div className="absolute inset-0 rounded-full overflow-hidden shadow-[var(--shadow-elegant)] ring-1 ring-border bg-background">
        {/* Moving strip: two copies of the world map to create seamless eastward spin */}
        <div className="absolute inset-0 relative w-[200%] h-full flex animate-earth-scroll">
          <img
            src={worldMap}
            alt="World map equirectangular"
            className="h-full w-1/2 object-cover"
            draggable={false}
          />
          <img
            src={worldMap}
            alt=""
            aria-hidden
            className="h-full w-1/2 object-cover"
            draggable={false}
          />

          {/* City markers duplicated for seamless loop */}
          <CityPin x={82} y={40} label="Tokyo" offsetPct={0} />
          <CityPin x={82} y={40} label="Tokyo" offsetPct={50} />

          <CityPin x={56} y={30} label="Berlin" offsetPct={0} />
          <CityPin x={56} y={30} label="Berlin" offsetPct={50} />

          <CityPin x={12} y={45} label="San Francisco" offsetPct={0} />
          <CityPin x={12} y={45} label="San Francisco" offsetPct={50} />

          <CityPin x={38} y={70} label="Buenos Aires" offsetPct={0} />
          <CityPin x={38} y={70} label="Buenos Aires" offsetPct={50} />
        </div>

        {/* Atmosphere and specular highlight */}
        <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
        <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-transparent mix-blend-multiply"></div>
      </div>

      {/* Outer glow */}
      <div className="absolute -inset-1 rounded-full bg-primary/30 blur-md pointer-events-none"></div>
    </div>
  );
};

export default AnimatedGlobe;
