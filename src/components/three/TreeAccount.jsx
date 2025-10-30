import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFloatingAnimation } from '../../hooks/useFloatingAnimation';
import { RippleEffect } from './RippleEffect';

export function TreeAccount({ 
  name, 
  position, 
  scale, 
  onSelect, 
  isSelected, 
  clickCount, 
  isAsset, 
  balance = 0 
}) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      if (isSelected) {
        groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.3, scale * 1.3, scale * 1.3), 0.1);
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else if (hovered) {
        groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.1, scale * 1.1, scale * 1.1), 0.1);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        groupRef.current.rotation.y = 0;
      }
    }
  });

  const baseColor = isAsset ? '#2d5016' : '#8b4513';
  const foliageColor = isAsset ? '#4a7c3c' : '#cd853f';
  const selectedColor = isSelected ? (clickCount === 1 ? '#4ecdc4' : '#ff6b6b') : (isAsset ? '#6ea057' : '#d2691e');

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={floatingRef}>
        {/* Base platform */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
          <meshStandardMaterial 
            color="#e8e8e8" 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Tree trunk */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 16]} />
          <meshStandardMaterial color={baseColor} roughness={0.8} />
        </mesh>

        {/* Foliage layers */}
        {[
          { position: [0, 1.3, 0], size: 0.5 },
          { position: [0, 1.6, 0], size: 0.4 },
          { position: [0, 1.85, 0], size: 0.3 }
        ].map((layer, index) => (
          <mesh key={index} position={layer.position}>
            <sphereGeometry args={[layer.size, 16, 16]} />
            <meshStandardMaterial 
              color={hovered ? (isAsset ? '#5a8f45' : '#daa520') : foliageColor}
              roughness={0.7}
              emissive={isSelected ? selectedColor : '#000000'}
              emissiveIntensity={isSelected ? 0.3 - (index * 0.1) : 0}
            />
          </mesh>
        ))}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
                emissive={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
                emissive={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        {/* Shadow effect */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial 
            color="#000000" 
            transparent 
            opacity={0.2}
          />
        </mesh>

        {/* Ripple effect */}
        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
        />

        {/* Labels */}
        <Text
          position={[0, 2.3, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {name}
        </Text>

        {isSelected && (
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            fontWeight="bold"
          >
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : ''}
          </Text>
        )}

        <Text
          position={[0, -0.6, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}