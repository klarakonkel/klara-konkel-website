import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader, Vector3, Group } from "three";
import earthTexture from "@/assets/earth-4k.jpg";

type City = {
  name: string;
  lat: number; // latitude in degrees
  lon: number; // longitude in degrees
};

const CITIES: City[] = [
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Buenos Aires", lat: -34.6118, lon: -58.3960 },
];

function latLonToVector3(radius: number, lat: number, lon: number): Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = -radius * Math.cos(latRad) * Math.sin(lonRad);
  return new Vector3(x, y, z);
}

const Earth = () => {
  const texture = useLoader(TextureLoader, earthTexture);
  const groupRef = useRef<Group>(null);

  // Slower west-to-east rotation (60% slower)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const markerPositions = useMemo(() =>
    CITIES.map((c) => ({ ...c, pos: latLonToVector3(1.01, c.lat, c.lon) })),
  []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 128, 64]} />
        <meshStandardMaterial 
          map={texture} 
          metalness={0.1}
          roughness={0.6}
          transparent={false}
          emissive="#111111"
          emissiveIntensity={0.2}
        />
      </mesh>

      {markerPositions.map(({ name, pos }) => (
        <mesh key={name} position={pos.toArray()}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial 
            color="#ff4444" 
            emissive="#ff4444" 
            emissiveIntensity={1.0}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
      ))}

      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
};

const AnimatedGlobe: React.FC = () => {
  return (
    <div className="relative mx-auto h-48 w-48 md:h-56 md:w-56" aria-label="Interactive 3D globe with city markers - drag to explore">
      <Canvas 
        camera={{ position: [0, 0, 2.6], fov: 45 }} 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate={false}
          dampingFactor={0.1}
          enableDamping={true}
        />
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
