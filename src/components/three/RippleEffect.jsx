import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export function RippleEffect({ position, visible, color = '#4ecdc4' }) {
  const rippleRef = useRef();
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (rippleRef.current && visible) {
      setScale(prev => Math.min(prev + 0.1, 3));
      setOpacity(prev => Math.max(prev - 0.02, 0));
    }
  });

  useEffect(() => {
    if (visible) {
      setScale(0);
      setOpacity(1);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <mesh ref={rippleRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale, 1, scale]}>
      <circleGeometry args={[0.5, 32]} />
      <meshStandardMaterial 
        color={color}
        transparent
        opacity={opacity}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}