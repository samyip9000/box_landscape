import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function useFloatingAnimation(speed = 1, amplitude = 0.1) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * speed) * amplitude;
    }
  });
  
  return ref;
}