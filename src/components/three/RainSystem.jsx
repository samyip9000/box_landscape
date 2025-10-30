import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function RainSystem({ intensity = 1, speed = 1 }) {
  const rainRef = useRef();
  const rainCount = Math.floor(1000 * intensity);
  
  useFrame((state) => {
    if (rainRef.current) {
      rainRef.current.children.forEach((drop, i) => {
        // Move rain drops downward
        drop.position.y -= speed * 0.1;
        
        // Reset position when drop reaches ground
        if (drop.position.y < -5) {
          drop.position.y = 25 + Math.random() * 10;
          drop.position.x = (Math.random() - 0.5) * 40;
          drop.position.z = (Math.random() - 0.5) * 40;
        }
        
        // Add slight swaying motion
        drop.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01;
      });
    }
  });

  return (
    <group ref={rainRef}>
      {Array.from({ length: rainCount }).map((_, i) => {
        const size = 0.001 + Math.random() * 0.003;
        const length = 0.2 + Math.random() * 0.4;
        return (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 40,
              Math.random() * 30 + 5,
              (Math.random() - 0.5) * 40
            ]}
          >
            <cylinderGeometry args={[size, size, length, 4]} />
            <meshStandardMaterial 
              color="#87CEEB" 
              transparent 
              opacity={0.4 + Math.random() * 0.4}
              emissive="#87CEEB"
              emissiveIntensity={0.1 + Math.random() * 0.2}
            />
          </mesh>
        );
      })}
      
      {/* Rain splash effects on ground */}
      {Array.from({ length: Math.floor(50 * intensity) }).map((_, i) => (
        <mesh
          key={`splash-${i}`}
          position={[
            (Math.random() - 0.5) * 40,
            0.02,
            (Math.random() - 0.5) * 40
          ]}
        >
          <circleGeometry args={[0.1 + Math.random() * 0.2, 8]} />
          <meshStandardMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.3}
            emissive="#87CEEB"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}