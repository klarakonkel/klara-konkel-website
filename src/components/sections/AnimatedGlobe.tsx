import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader, Vector3, Group } from "three";
import earthTexture from "@/assets/earth-2k.jpg";

type City = {
  name: string;
  lat: number; // latitude in degrees
  lon: number; // longitude in degrees
};

const CITIES: City[] = [
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
];

function latLonToVector3(radius: number, lat: number, lon: number): Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);
  return new Vector3(x, y, z);
}

const Earth = () => {
  const texture = useLoader(TextureLoader, earthTexture);
  const groupRef = useRef<Group>(null);

  // Smooth eastward (west-to-east) rotation — Asia → Americas → Europe → Asia
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.15;
    }
  });

  const markerPositions = useMemo(() =>
    CITIES.map((c) => ({ ...c, pos: latLonToVector3(1.01, c.lat, c.lon) })),
  []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {markerPositions.map(({ name, pos }) => (
        <group key={name} position={pos.toArray()}>
          <mesh>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
          <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
            <span className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm border border-border/50">
              {name}
            </span>
          </Html>
        </group>
      ))}

      {/* Lighting */}
      <hemisphereLight intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </group>
  );
};

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96" aria-label="Spinning 3D globe with city markers">
      <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <Earth />
      </Canvas>

      {/* Subtle overlays for depth and theme harmony */}
      <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-transparent mix-blend-multiply" />
      <div className="absolute -inset-1 rounded-full bg-primary/30 blur-md pointer-events-none" />
    </div>
  );
};

export default AnimatedGlobe;
