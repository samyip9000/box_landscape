import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Sky, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// LIABILITIES - Right Side (using different objects as containers)
const liabilityAccounts = [
  { name: 'Credit Card Debt', position: [8, 0, 2], scale: 1.2, type: 'creditcard' },
  { name: 'Bank Loan', position: [8, 0, -2], scale: 1.5, type: 'document' },
  { name: 'Accounts Payable', position: [4, 0, -2], scale: 1.0, type: 'invoice' },
  { name: 'Mortgage', position: [4, 0, 2], scale: 1.8, type: 'house' },
  { name: 'Tax Payable', position: [6, 0, 0], scale: 1.3, type: 'tax' },
  { name: 'Accrued Expenses', position: [6, 0, -4], scale: 1.5, type: 'accrued' },
  { name: 'Short-term Debt', position: [4, 0, 0], scale: 1.6, type: 'iou' },
];

// ASSETS - Left Side (using different objects)
const assetAccounts = [
  { name: 'Cash Account', position: [-4, 0, 4], scale: 1.4, type: 'safe', rotation: -Math.PI / 2 },
  { name: 'HSBC Bank', position: [-8, 0, 2], scale: 1.6, type: 'bank' },
  { name: 'Inventory', position: [-8, 0, -2], scale: 1.2, type: 'warehouse' },
  { name: 'Equipment', position: [-6, 0, 0], scale: 1.5, type: 'machine' },
  { name: 'Real Estate', position: [-4, 0, 2], scale: 1.8, type: 'office' },
  { name: 'Investments', position: [-4, 0, -2], scale: 1.3, type: 'stock' },
];

// Rain System Component
function RainSystem({ intensity = 1, speed = 1 }) {
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
        const size = 0.001 + Math.random() * 0.003; // Varied drop sizes
        const length = 0.2 + Math.random() * 0.4; // Varied drop lengths
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

// Ripple Effect Component
function RippleEffect({ position, visible, color = '#4ecdc4' }) {
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


// Floating Animation Hook
function useFloatingAnimation(speed = 1, amplitude = 0.1) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * speed) * amplitude;
    }
  });
  
  return ref;
}

// HSBC Bank Building Component
function BankBuilding({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0, rotation = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      if (isSelected) {
        groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.3, scale * 1.3, scale * 1.3), 0.1);
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + rotation;
      } else if (hovered) {
        groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.1, scale * 1.1, scale * 1.1), 0.1);
        groupRef.current.rotation.y = rotation;
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        groupRef.current.rotation.y = rotation;
      }
    }
  });

  const selectedColor = isSelected ? (clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b') : '#e60000';

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={[0, rotation, 0]}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={floatingRef}>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Building foundation */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.6]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Main building body - taller and wider */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.65, 1.8, 0.6]} />
        <meshStandardMaterial color={hovered ? '#c41e3a' : '#e60000'} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* HSBC logo red and white stripes - improved pattern */}
      <mesh position={[0, 1.8, 0.31]}>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} emissive="#ffffff" emissiveIntensity={isSelected ? 0.3 : 0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0.31]}>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} emissive="#ffffff" emissiveIntensity={isSelected ? 0.3 : 0.1} />
      </mesh>

      {/* HSBC letters on logo */}
      <mesh position={[0, 1.5, 0.32]}>
        <boxGeometry args={[0.4, 0.08, 0.003]} />
        <meshStandardMaterial color="#e60000" roughness={0.8} />
      </mesh>

      {/* Window grid pattern - modern glass effect */}
      {Array.from({ length: 5 }).map((_, floor) => (
        <group key={`floor-${floor}`}>
          {Array.from({ length: 3}).map((_, col) => (
            <mesh key={`window-${floor}-${col}`} position={[-0.15 + col * 0.15, 0.4 + floor * 0.35, 0.305]} castShadow>
              <boxGeometry args={[0.12, 0.25, 0.01]} />
              <meshStandardMaterial 
                color="#87ceeb" 
                roughness={0.05} 
                metalness={0.9} 
                emissive="#b0d4f1" 
                emissiveIntensity={isSelected ? 0.6 : 0.2}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Glass entrance doors */}
      <mesh position={[0, 0.5, 0.305]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.015]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.3} roughness={0.05} metalness={0.9} />
      </mesh>

      {/* Entrance canopy */}
      <mesh position={[0, 0.75, 0.35]} castShadow>
        <boxGeometry args={[0.4, 0.08, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Rooftop elements */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.65]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Building lights at corners */}
      {[
        [-0.32, 2.0, 0.3],
        [0.32, 2.0, 0.3],
        [-0.32, 2.0, -0.3],
        [0.32, 2.0, -0.3]
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={isSelected ? 1 : 0.5} />
          {isSelected && <pointLight intensity={0.3} distance={2} color="#ffd700" />}
        </mesh>
      ))}

      {/* Corner pillars for architectural detail */}
      {[-0.325, 0.325].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.305]} castShadow>
          <boxGeometry args={[0.05, 1.8, 0.02]} />
          <meshStandardMaterial color="#8b0000" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}

      {/* Sides windows */}
      {Array.from({ length: 5 }).map((_, floor) => (
        Array.from({ length: 2}).map((_, col) => (
          <mesh key={`side-${floor}-${col}`} position={[0.33, 0.4 + floor * 0.35, -0.2 + col * 0.4]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.25, 0.01]} />
            <meshStandardMaterial 
              color="#87ceeb" 
              roughness={0.05} 
              metalness={0.9} 
              emissive="#b0d4f1" 
              emissiveIntensity={isSelected ? 0.6 : 0.2}
            />
          </mesh>
        ))
      ))}

      {/* Security cameras */}
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.9, 0.28]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* Selection indicator */}
      {isSelected && (
        <>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
            <meshStandardMaterial 
              color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
            <meshStandardMaterial 
              color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      <RippleEffect 
        position={[0, 0.01, 0]} 
        visible={isSelected && clickCount > 0}
        color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
      />

      <Text position={[0, 2.4, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
        {name}
      </Text>

      {isSelected && (
        <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
          {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
        </Text>
      )}

      <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
        ${balance.toFixed(2)}
      </Text>
      </group>
    </group>
  );
}

// Lorry/Truck Component
function LorryAccount({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
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

  const selectedColor = isSelected ? (clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b') : '#ff6600';

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
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Lorry cab */}
      <mesh position={[-0.15, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.3]} />
        <meshStandardMaterial color={hovered ? '#ff8533' : '#ff6600'} roughness={0.5} />
      </mesh>

      {/* Lorry cargo area */}
      <mesh position={[0.15, 0.55, 0]}>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color={hovered ? '#e6e6fa' : '#d3d3d3'} roughness={0.6} />
      </mesh>

      {/* Wheels */}
      {[[-0.05, -0.05], [0.35, -0.05]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.15, pos[1]]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}

      {/* Selection indicator */}
      {isSelected && (
        <>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
            <meshStandardMaterial 
              color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
            <meshStandardMaterial 
              color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      <RippleEffect 
        position={[0, 0.01, 0]} 
        visible={isSelected && clickCount > 0}
        color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
      />

      <Text position={[0, 1.2, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
        {name}
      </Text>

      {isSelected && (
        <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
          {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
        </Text>
      )}

      <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
        ${balance.toFixed(2)}
      </Text>
      </group>
    </group>
  );
}

// Safe/Vault Component - High-end game quality
function SafeVault({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0, rotation = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const doorRef = useRef();

  useFrame((state) => {
    if (floatingRef.current) {
      if (isSelected) {
        floatingRef.current.scale.lerp(new THREE.Vector3(scale * 1.3, scale * 1.3, scale * 1.3), 0.1);
        floatingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + rotation;
      } else if (hovered) {
        floatingRef.current.scale.lerp(new THREE.Vector3(scale * 1.1, scale * 1.1, scale * 1.1), 0.1);
        floatingRef.current.rotation.y = rotation;
      } else {
        floatingRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        floatingRef.current.rotation.y = rotation;
      }
    }
    
    // Animated door opening when selected
    if (doorRef.current && isSelected) {
      doorRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    } else if (doorRef.current) {
      doorRef.current.rotation.y = 0;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={floatingRef} rotation={[0, rotation, 0]}>
        {/* Base platform */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Safe body */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.8, 1.4, 0.7]} />
          <meshStandardMaterial 
            color={hovered ? "#4a4a4a" : "#2c2c2c"}
            roughness={0.2}
            metalness={0.9}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Safe door */}
        <group ref={doorRef} position={[0.4, 0.7, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 1.2, 0.65]} />
            <meshStandardMaterial 
              color={hovered ? "#5a5a5a" : "#3c3c3c"}
              roughness={0.15}
              metalness={0.95}
            />
          </mesh>

          {/* Door handle/wheel */}
          <mesh position={[0.03, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.15, 0.03, 16, 32]} />
            <meshStandardMaterial 
              color="#d4af37"
              roughness={0.1}
              metalness={1}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Wheel spokes */}
          {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
            <mesh 
              key={i}
              position={[
                0.03,
                0.1 + Math.cos(angle) * 0.12,
                Math.sin(angle) * 0.12
              ]}
              rotation={[0, angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
              <meshStandardMaterial 
                color="#d4af37"
                roughness={0.1}
                metalness={1}
              />
            </mesh>
          ))}
        </group>

        {/* Hinges */}
        {[-0.4, 0.4].map((y, i) => (
          <mesh key={i} position={[-0.4, 0.7 + y, 0.35]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* Lock mechanism */}
        <mesh position={[0.42, 0.9, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Digital display */}
        <mesh position={[0.42, 0.5, 0]}>
          <boxGeometry args={[0.06, 0.15, 0.25]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            emissive={isSelected ? "#00ff00" : "#003300"}
            emissiveIntensity={isSelected ? 0.8 : 0.2}
          />
        </mesh>

        {/* Gold bars visible inside when selected */}
        {isSelected && (
          <group position={[0, 0.7, 0]}>
            {[0, 0.15, -0.15].map((x, i) => (
              <mesh key={i} position={[x - 0.1, -0.2, 0]}>
                <boxGeometry args={[0.12, 0.06, 0.08]} />
                <meshStandardMaterial 
                  color="#ffd700"
                  roughness={0.1}
                  metalness={1}
                  emissive="#ffd700"
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />
      </group>

      {/* Text labels outside rotation group - always upright */}
      <Text position={[0, 2.2, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
        {name}
      </Text>

      {isSelected && (
        <Text position={[0, 0.1, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
          {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
        </Text>
      )}

      <Text position={[0, -0.2, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
        ${balance.toFixed(2)}
      </Text>
    </group>
  );
}

// Warehouse/Storage Container Component
function WarehouseContainer({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const doorRef = useRef();

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

    // Sliding door animation
    if (doorRef.current && isSelected) {
      doorRef.current.position.x = Math.sin(state.clock.elapsedTime) * 0.3;
    } else if (doorRef.current) {
      doorRef.current.position.x = 0;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Container body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.9, 1.2, 0.6]} />
          <meshStandardMaterial 
            color={hovered ? "#e67300" : "#cc6600"}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>

        {/* Corrugated pattern (vertical ribs) */}
        {[-0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 0.6, 0.305]} castShadow>
            <boxGeometry args={[0.04, 1.2, 0.01]} />
            <meshStandardMaterial 
              color={hovered ? "#d66a00" : "#b35900"}
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
        ))}

        {/* Sliding door */}
        <group ref={doorRef} position={[0, 0.6, 0.305]}>
          <mesh castShadow>
            <boxGeometry args={[0.85, 1.15, 0.03]} />
            <meshStandardMaterial 
              color={hovered ? "#f5f5f5" : "#e0e0e0"}
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>

          {/* Door handle */}
          <mesh position={[0.3, 0, 0.03]}>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Corner reinforcements */}
        {[
          [-0.45, 0.6, 0.3], [0.45, 0.6, 0.3],
          [-0.45, 0.6, -0.3], [0.45, 0.6, -0.3]
        ].map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <boxGeometry args={[0.06, 1.25, 0.06]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
        ))}

        {/* Top frame */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.95, 0.08, 0.65]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Bottom frame */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.95, 0.08, 0.65]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Shipping label */}
        <mesh position={[0, 0.9, 0.31]}>
          <boxGeometry args={[0.3, 0.2, 0.01]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.8}
          />
        </mesh>

        {/* Barcode on label */}
        {[0, 0.04, 0.08, 0.12, 0.16].map((offset, i) => (
          <mesh key={i} position={[-0.1 + offset, 0.9, 0.315]}>
            <boxGeometry args={[0.02, 0.15, 0.005]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        ))}

        {/* Warning stripes */}
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0.31]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.08, 0.01]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Boxes visible inside when selected */}
        {isSelected && (
          <group position={[0, 0.4, 0]}>
            {[
              [-0.15, 0, 0], [0, 0, 0], [0.15, 0, 0],
              [-0.15, 0.2, 0], [0, 0.2, 0]
            ].map((pos, i) => (
              <mesh key={i} position={pos}>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <meshStandardMaterial 
                  color="#8b4513"
                  roughness={0.8}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.6, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Industrial Machine Component
function IndustrialMachine({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const gearRef1 = useRef();
  const gearRef2 = useRef();

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

    // Rotating gears
    if (gearRef1.current) {
      gearRef1.current.rotation.z += isSelected ? 0.05 : 0.01;
    }
    if (gearRef2.current) {
      gearRef2.current.rotation.z -= isSelected ? 0.05 : 0.01;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Machine base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.0, 0.3, 0.7]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Main body */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.6]} />
          <meshStandardMaterial 
            color={hovered ? "#3a7ca5" : "#2c5f8d"}
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Control panel */}
        <mesh position={[0, 1.0, 0.31]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Screen */}
        <mesh position={[0, 1.0, 0.335]}>
          <boxGeometry args={[0.35, 0.25, 0.01]} />
          <meshStandardMaterial 
            color="#001a1a"
            emissive={isSelected ? "#00ff00" : "#003300"}
            emissiveIntensity={isSelected ? 0.8 : 0.3}
          />
        </mesh>

        {/* Buttons */}
        {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
          <mesh key={i} position={[x, 0.85, 0.335]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial 
              color={i === 0 ? "#ff0000" : i === 1 ? "#ffff00" : "#00ff00"}
              emissive={i === 0 ? "#ff0000" : i === 1 ? "#ffff00" : "#00ff00"}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        ))}

        {/* Gear housing left */}
        <mesh position={[-0.25, 0.7, 0.31]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 32]} />
          <meshStandardMaterial 
            color="#4a4a4a"
            roughness={0.3}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Visible gear left */}
        <group ref={gearRef1} position={[-0.25, 0.7, 0.31]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 8]} />
            <meshStandardMaterial 
              color="#d4af37"
              roughness={0.2}
              metalness={1}
            />
          </mesh>
          {/* Gear teeth */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh 
                key={i}
                position={[Math.cos(angle) * 0.16, 0, Math.sin(angle) * 0.16]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.06, 0.08, 0.04]} />
                <meshStandardMaterial 
                  color="#d4af37"
                  roughness={0.2}
                  metalness={1}
                />
              </mesh>
            );
          })}
        </group>

        {/* Gear housing right */}
        <mesh position={[0.25, 0.7, 0.31]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 32]} />
          <meshStandardMaterial 
            color="#4a4a4a"
            roughness={0.3}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Visible gear right */}
        <group ref={gearRef2} position={[0.25, 0.7, 0.31]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 8]} />
            <meshStandardMaterial 
              color="#d4af37"
              roughness={0.2}
              metalness={1}
            />
          </mesh>
          {/* Gear teeth */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh 
                key={i}
                position={[Math.cos(angle) * 0.16, 0, Math.sin(angle) * 0.16]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.06, 0.08, 0.04]} />
                <meshStandardMaterial 
                  color="#d4af37"
                  roughness={0.2}
                  metalness={1}
                />
              </mesh>
            );
          })}
        </group>

        {/* Pistons */}
        {[-0.3, 0.3].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.4, -0.31]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
              <meshStandardMaterial 
                color="#c0c0c0"
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>
          </group>
        ))}

        {/* Exhaust pipes */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 1.2, -0.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* Warning stripes */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={i} position={[0, 0.35, z]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.08, 0.01]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Status lights */}
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 1.15, 0.31]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial 
              color={isSelected && i % 2 === 0 ? "#00ff00" : "#ff0000"}
              emissive={isSelected && i % 2 === 0 ? "#00ff00" : "#ff0000"}
              emissiveIntensity={isSelected ? 1 : 0.3}
            />
          </mesh>
        ))}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.7, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Office Building Component
function OfficeBuilding({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Building base/foundation */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.7]} />
          <meshStandardMaterial 
            color="#4a4a4a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Main building body */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.7, 1.5, 0.6]} />
          <meshStandardMaterial 
            color={hovered ? "#5a6f8a" : "#4a5f7a"}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Windows grid - Front face */}
        {Array.from({ length: 5 }).map((_, floor) => (
          <group key={`front-${floor}`}>
            {Array.from({ length: 3 }).map((_, col) => (
              <mesh 
                key={`window-f-${floor}-${col}`}
                position={[-0.2 + col * 0.2, 0.4 + floor * 0.3, 0.305]}
              >
                <boxGeometry args={[0.12, 0.2, 0.01]} />
                <meshStandardMaterial 
                  color="#87ceeb"
                  roughness={0.1}
                  metalness={0.9}
                  emissive="#b0d4f1"
                  emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Windows grid - Side face */}
        {Array.from({ length: 5 }).map((_, floor) => (
          <group key={`side-${floor}`}>
            {Array.from({ length: 2 }).map((_, col) => (
              <mesh 
                key={`window-s-${floor}-${col}`}
                position={[0.355, 0.4 + floor * 0.3, -0.15 + col * 0.3]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <boxGeometry args={[0.12, 0.2, 0.01]} />
                <meshStandardMaterial 
                  color="#87ceeb"
                  roughness={0.1}
                  metalness={0.9}
                  emissive="#b0d4f1"
                  emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Roof */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.75, 0.1, 0.65]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Rooftop details - Helipad */}
        <mesh position={[0, 1.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial 
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* H letter on helipad */}
        <Text position={[0, 1.87, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.15} color="#000000" anchorX="center" anchorY="middle">
          H
        </Text>

        {/* Air conditioning units */}
        {[-0.25, 0.25].map((x, i) => (
          <mesh key={i} position={[x, 1.9, 0.2]} castShadow>
            <boxGeometry args={[0.15, 0.08, 0.1]} />
            <meshStandardMaterial 
              color="#6a6a6a"
              roughness={0.6}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Entrance canopy */}
        <mesh position={[0, 0.4, 0.35]} castShadow>
          <boxGeometry args={[0.4, 0.05, 0.15]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Glass entrance doors */}
        <mesh position={[0, 0.5, 0.305]}>
          <boxGeometry args={[0.25, 0.4, 0.02]} />
          <meshStandardMaterial 
            color="#87ceeb"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Company logo/sign */}
        <mesh position={[0, 1.6, 0.31]}>
          <boxGeometry args={[0.5, 0.15, 0.02]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Building lights at corners */}
        {[
          [-0.35, 1.75, 0.3], [0.35, 1.75, 0.3],
          [-0.35, 1.75, -0.3], [0.35, 1.75, -0.3]
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial 
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={isSelected ? 1 : 0.5}
            />
            {isSelected && <pointLight intensity={0.3} distance={2} color="#ffd700" />}
          </mesh>
        ))}

        {/* Balconies */}
        {[0.7, 1.3].map((y, i) => (
          <mesh key={i} position={[0, y, 0.32]} castShadow>
            <boxGeometry args={[0.6, 0.02, 0.1]} />
            <meshStandardMaterial 
              color="#3a3a3a"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
        ))}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 2.1, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Credit Card Component
function CreditCard({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const hologramRef = useRef();

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

    // Holographic effect
    if (hologramRef.current && isSelected) {
      hologramRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Card holder stand */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 0.8, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Credit card body */}
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.54, 0.03]} />
          <meshStandardMaterial 
            color={hovered ? "#1a4d7a" : "#0d3a5c"}
            roughness={0.2}
            metalness={0.8}
            emissive="#0d3a5c"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Holographic chip */}
        <mesh position={[-0.2, 0.93, 0.02]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.015]} />
          <meshStandardMaterial 
            color="#ffd700"
            roughness={0.1}
            metalness={1}
            emissive="#ffd700"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Chip circuit pattern */}
        {[-0.04, -0.02, 0, 0.02, 0.04].map((offset, i) => (
          <mesh key={i} position={[-0.2 + offset, 0.93, 0.028]}>
            <boxGeometry args={[0.01, 0.1, 0.005]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Card number embossed */}
        {[0, 1, 2, 3].map((group, gi) => (
          <group key={gi}>
            {[0, 1, 2, 3].map((num, ni) => (
              <mesh 
                key={ni}
                position={[-0.3 + gi * 0.2, 0.88, 0.02]}
              >
                <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                <meshStandardMaterial 
                  color="#ffffff"
                  roughness={0.4}
                  metalness={0.6}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Magnetic stripe */}
        <mesh position={[0, 0.9, -0.016]}>
          <boxGeometry args={[0.85, 0.08, 0.001]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Card logo/brand area */}
        <mesh position={[0.25, 0.95, 0.02]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial 
            color="#ff6b00"
            emissive="#ff6b00"
            emissiveIntensity={0.3}
          />
        </mesh>

        <mesh position={[0.32, 0.95, 0.02]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Card holder name embossed */}
        <mesh position={[-0.15, 0.83, 0.02]}>
          <boxGeometry args={[0.3, 0.03, 0.008]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.5}
          />
        </mesh>

        {/* Expiry date */}
        <mesh position={[0.15, 0.83, 0.02]}>
          <boxGeometry args={[0.1, 0.025, 0.008]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.5}
          />
        </mesh>

        {/* CVV on back */}
        <mesh position={[0.3, 0.85, -0.016]}>
          <boxGeometry args={[0.12, 0.04, 0.001]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.6}
          />
        </mesh>

        {/* Warning light indicator */}
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={isSelected ? 1 : 0.5}
          />
          {isSelected && <pointLight intensity={0.5} distance={2} color="#ff0000" />}
        </mesh>

        {/* Holographic security feature */}
        <mesh ref={hologramRef} position={[0.1, 0.9, 0.025]}>
          <boxGeometry args={[0.2, 0.15, 0.005]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.3}
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Legal Document/Contract Component
function LegalDocument({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const pagesRef = useRef([]);

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

    // Animated pages flipping when selected
    pagesRef.current.forEach((page, i) => {
      if (page && isSelected) {
        page.rotation.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.3;
      } else if (page) {
        page.rotation.y = 0;
      }
    });
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Marble pedestal */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.3, 0.6, 32]} />
          <meshStandardMaterial 
            color={hovered ? "#d4d4d4" : "#c0c0c0"}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Pedestal top */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.3, 0.05, 32]} />
          <meshStandardMaterial 
            color="#a0a0a0"
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* Document folder/binder base */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.6, 0.05, 0.45]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.6}
          />
        </mesh>

        {/* Main document pages stack */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh 
            key={i}
            ref={(el) => pagesRef.current[i] = el}
            position={[0, 0.81 + i * 0.002, 0]} 
            castShadow
          >
            <boxGeometry args={[0.55, 0.001, 0.4]} />
            <meshStandardMaterial 
              color="#f5f5f5"
              roughness={0.8}
            />
          </mesh>
        ))}

        {/* Top document with text lines */}
        <mesh position={[0, 0.83, 0]} castShadow>
          <boxGeometry args={[0.55, 0.002, 0.4]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.7}
          />
        </mesh>

        {/* Document header */}
        <mesh position={[0, 0.835, 0.15]}>
          <boxGeometry args={[0.4, 0.003, 0.06]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.9}
          />
        </mesh>

        {/* Text lines on document */}
        {[0.08, 0.04, 0, -0.04, -0.08, -0.12].map((z, i) => (
          <mesh key={i} position={[0, 0.835, z]}>
            <boxGeometry args={[0.45, 0.003, 0.01]} />
            <meshStandardMaterial 
              color="#4a4a4a"
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Signature line */}
        <mesh position={[0.1, 0.835, -0.16]}>
          <boxGeometry args={[0.25, 0.003, 0.01]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.9}
          />
        </mesh>

        {/* Signature (scribble effect) */}
        <mesh position={[0.1, 0.836, -0.16]}>
          <torusGeometry args={[0.04, 0.005, 8, 16]} />
          <meshStandardMaterial 
            color="#0000ff"
            roughness={0.8}
          />
        </mesh>

        {/* Official seal/stamp */}
        <mesh position={[-0.15, 0.836, -0.14]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.06, 0.06, 0.005, 32]} />
          <meshStandardMaterial 
            color="#cc0000"
            emissive="#cc0000"
            emissiveIntensity={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Seal inner circle */}
        <mesh position={[-0.15, 0.837, -0.14]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.04, 0.04, 0.006, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.8}
          />
        </mesh>

        {/* Paper clips */}
        {[-0.2, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.84, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.03, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Ribbon/bookmark */}
        <mesh position={[0.25, 0.8, 0]} castShadow>
          <boxGeometry args={[0.04, 0.3, 0.01]} />
          <meshStandardMaterial 
            color="#8b0000"
            roughness={0.6}
          />
        </mesh>

        {/* Wax seal on folder */}
        <mesh position={[0, 0.78, 0.23]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
          <meshStandardMaterial 
            color="#8b0000"
            roughness={0.4}
          />
        </mesh>

        {/* Urgent/important stamp */}
        <mesh position={[0.15, 0.836, 0.05]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.15, 0.06, 0.002]} />
          <meshStandardMaterial 
            color="#ff0000"
            transparent
            opacity={0.6}
            emissive="#ff0000"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Warning lights on pedestal */}
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.3, 0.4, Math.sin(angle) * 0.3]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color="#ff6b00"
              emissive="#ff6b00"
              emissiveIntensity={isSelected ? 1 : 0.3}
            />
          </mesh>
        ))}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.3, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Invoice Stack/Bills Component
function InvoiceStack({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const invoicesRef = useRef([]);

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

    // Animated floating invoices
    invoicesRef.current.forEach((invoice, i) => {
      if (invoice && isSelected) {
        invoice.position.y = 0.8 + i * 0.08 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
        invoice.rotation.y = Math.sin(state.clock.elapsedTime + i) * 0.1;
      } else if (invoice) {
        invoice.position.y = 0.8 + i * 0.08;
        invoice.rotation.y = i * 0.05;
      }
    });
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Desk/table surface */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.7]} />
          <meshStandardMaterial 
            color={hovered ? "#6b4423" : "#5c3a1f"}
            roughness={0.6}
          />
        </mesh>

        {/* Wooden texture lines */}
        {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.19, 0]}>
            <boxGeometry args={[0.02, 0.005, 0.7]} />
            <meshStandardMaterial 
              color="#4a2f1a"
              roughness={0.8}
            />
          </mesh>
        ))}

        {/* Filing tray */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.65, 0.05, 0.5]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Tray sides */}
        {[-0.325, 0.325].map((x, i) => (
          <mesh key={`side-${i}`} position={[x, 0.35, 0]} castShadow>
            <boxGeometry args={[0.02, 0.15, 0.5]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        ))}
        {[-0.25, 0.25].map((z, i) => (
          <mesh key={`front-${i}`} position={[0, 0.35, z]} castShadow>
            <boxGeometry args={[0.65, 0.15, 0.02]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        ))}

        {/* Stack of invoices/bills */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const colors = ['#ffffff', '#ffe6e6', '#fff9e6', '#e6f9ff', '#ffe6f9', '#f0fff0'];
          return (
            <mesh 
              key={i}
              ref={(el) => invoicesRef.current[i] = el}
              position={[
                Math.sin(i * 0.3) * 0.05,
                0.8 + i * 0.08,
                Math.cos(i * 0.3) * 0.05
              ]} 
              rotation={[0, i * 0.05, 0]}
              castShadow
            >
              <boxGeometry args={[0.45, 0.001, 0.32]} />
              <meshStandardMaterial 
                color={colors[i]}
                roughness={0.9}
              />
            </mesh>
          );
        })}

        {/* Top invoice details */}
        <group position={[0, 1.31, 0]}>
          {/* Invoice header */}
          <mesh position={[0, 0.001, 0.12]}>
            <boxGeometry args={[0.35, 0.002, 0.05]} />
            <meshStandardMaterial 
              color="#ff0000"
              roughness={0.8}
            />
          </mesh>

          {/* "OVERDUE" stamp */}
          <mesh position={[0.1, 0.002, 0.05]} rotation={[0, 0, Math.PI / 8]}>
            <boxGeometry args={[0.12, 0.05, 0.002]} />
            <meshStandardMaterial 
              color="#ff0000"
              transparent
              opacity={0.7}
              emissive="#ff0000"
              emissiveIntensity={isSelected ? 0.5 : 0.2}
            />
          </mesh>

          {/* Invoice lines */}
          {[0.06, 0.02, -0.02, -0.06, -0.10].map((z, i) => (
            <mesh key={i} position={[0, 0.001, z]}>
              <boxGeometry args={[0.38, 0.002, 0.008]} />
              <meshStandardMaterial 
                color="#1a1a1a"
                roughness={0.9}
              />
            </mesh>
          ))}

          {/* Amount highlighted */}
          <mesh position={[0, 0.002, -0.12]}>
            <boxGeometry args={[0.15, 0.002, 0.03]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>

        {/* Calculator */}
        <mesh position={[0.35, 0.22, -0.15]} rotation={[0, -Math.PI / 6, 0]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.18]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.4}
          />
        </mesh>

        {/* Calculator display */}
        <mesh position={[0.35, 0.24, -0.08]} rotation={[0, -Math.PI / 6, 0]}>
          <boxGeometry args={[0.1, 0.005, 0.04]} />
          <meshStandardMaterial 
            color="#003300"
            emissive="#00ff00"
            emissiveIntensity={isSelected ? 0.8 : 0.3}
          />
        </mesh>

        {/* Calculator buttons */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <mesh 
              key={`btn-${row}-${col}`}
              position={[
                0.35 + (col - 1) * 0.03,
                0.24,
                -0.12 + row * 0.025
              ]}
              rotation={[0, -Math.PI / 6, 0]}
            >
              <boxGeometry args={[0.02, 0.003, 0.02]} />
              <meshStandardMaterial 
                color="#4a4a4a"
                roughness={0.6}
              />
            </mesh>
          ))
        )}

        {/* Pen/marker */}
        <mesh position={[-0.25, 0.2, 0.1]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
          <meshStandardMaterial 
            color="#0066cc"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Pen cap */}
        <mesh position={[-0.25, 0.27, 0.1]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.012, 0.01, 0.03, 16]} />
          <meshStandardMaterial 
            color="#003399"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Coffee mug with stain */}
        <mesh position={[-0.35, 0.24, -0.2]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.08, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.3}
          />
        </mesh>

        {/* Coffee inside */}
        <mesh position={[-0.35, 0.26, -0.2]}>
          <cylinderGeometry args={[0.045, 0.04, 0.02, 32]} />
          <meshStandardMaterial 
            color="#3d2817"
            roughness={0.2}
          />
        </mesh>

        {/* Mug handle */}
        <mesh position={[-0.4, 0.24, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.03, 0.008, 16, 32, Math.PI]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.3}
          />
        </mesh>

        {/* Coffee stain on desk */}
        <mesh position={[-0.3, 0.191, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial 
            color="#6b4423"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Sticky notes */}
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i}
            position={[0.25, 0.2 + i * 0.002, 0.15]} 
            castShadow
          >
            <boxGeometry args={[0.08, 0.001, 0.08]} />
            <meshStandardMaterial 
              color={['#ffff99', '#ff99cc', '#99ccff'][i]}
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Paper clips scattered */}
        {[-0.15, -0.05, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.2, -0.28]} rotation={[Math.PI / 2, 0, i * Math.PI / 4]}>
            <torusGeometry args={[0.015, 0.003, 8, 16, Math.PI]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Stress indicator - red exclamation marks */}
        {isSelected && (
          <>
            <Text position={[-0.4, 1.5, 0]} fontSize={0.2} color="#ff0000" anchorX="center" anchorY="middle">
              !
            </Text>
            <Text position={[0.4, 1.5, 0]} fontSize={0.2} color="#ff0000" anchorX="center" anchorY="middle">
              !
            </Text>
          </>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.7, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// House with Mortgage Sign Component
function MortgageHouse({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const signRef = useRef();

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

    // Swinging sign
    if (signRef.current) {
      signRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Lawn/ground */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.75, 32]} />
          <meshStandardMaterial 
            color="#2d5016"
            roughness={0.95}
          />
        </mesh>

        {/* House foundation */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.7, 0.15, 0.6]} />
          <meshStandardMaterial 
            color="#4a4a4a"
            roughness={0.8}
          />
        </mesh>

        {/* Main house body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.65, 0.5, 0.55]} />
          <meshStandardMaterial 
            color={hovered ? "#d4a574" : "#c19a6b"}
            roughness={0.7}
          />
        </mesh>

        {/* Brick texture lines - horizontal */}
        {Array.from({ length: 8 }).map((_, row) => (
          <group key={`row-${row}`}>
            {Array.from({ length: 6 }).map((_, col) => (
              <mesh 
                key={`brick-${row}-${col}`}
                position={[-0.25 + col * 0.11, 0.4 + row * 0.065, 0.276]}
              >
                <boxGeometry args={[0.1, 0.06, 0.002]} />
                <meshStandardMaterial 
                  color="#8b4513"
                  roughness={0.9}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Roof */}
        <mesh position={[0, 1.0, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.5, 0.4, 4]} />
          <meshStandardMaterial 
            color="#8b4513"
            roughness={0.8}
          />
        </mesh>

        {/* Chimney */}
        <mesh position={[0.2, 1.1, -0.15]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial 
            color="#8b0000"
            roughness={0.9}
          />
        </mesh>

        {/* Chimney top */}
        <mesh position={[0.2, 1.27, -0.15]}>
          <boxGeometry args={[0.12, 0.03, 0.12]} />
          <meshStandardMaterial 
            color="#6b0000"
            roughness={0.8}
          />
        </mesh>

        {/* Front door */}
        <mesh position={[0, 0.45, 0.276]} castShadow>
          <boxGeometry args={[0.15, 0.3, 0.02]} />
          <meshStandardMaterial 
            color="#5c4033"
            roughness={0.8}
          />
        </mesh>

        {/* Door knob */}
        <mesh position={[0.05, 0.45, 0.287]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial 
            color="#ffd700"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Windows */}
        {[[-0.2, 0.6], [0.2, 0.6]].map((pos, i) => (
          <group key={i}>
            <mesh position={[pos[0], pos[1], 0.276]} castShadow>
              <boxGeometry args={[0.12, 0.15, 0.02]} />
              <meshStandardMaterial 
                color="#87ceeb"
                roughness={0.1}
                metalness={0.8}
                transparent
                opacity={0.6}
              />
            </mesh>
            {/* Window frame cross */}
            <mesh position={[pos[0], pos[1], 0.28]}>
              <boxGeometry args={[0.12, 0.01, 0.005]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[pos[0], pos[1], 0.28]}>
              <boxGeometry args={[0.01, 0.15, 0.005]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Attic window */}
        <mesh position={[0, 0.95, 0.25]} castShadow>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial 
            color="#87ceeb"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Front porch steps */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.18 + i * 0.05, 0.38 + i * 0.06]} castShadow>
            <boxGeometry args={[0.25, 0.03, 0.1]} />
            <meshStandardMaterial 
              color="#808080"
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Mailbox */}
        <mesh position={[-0.5, 0.35, 0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        <mesh position={[-0.5, 0.62, 0.3]} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.12]} />
          <meshStandardMaterial 
            color="#cc0000"
            roughness={0.5}
          />
        </mesh>

        {/* Mailbox flag */}
        <mesh position={[-0.54, 0.63, 0.3]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.03, 0.05, 0.01]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* "FOR SALE" sign post */}
        <mesh position={[0.45, 0.45, 0.2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
          <meshStandardMaterial 
            color="#5c4033"
            roughness={0.8}
          />
        </mesh>

        {/* Sign board */}
        <group ref={signRef} position={[0.45, 0.85, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.2, 0.02]} />
            <meshStandardMaterial 
              color="#ffffff"
              roughness={0.6}
            />
          </mesh>

          {/* "MORTGAGE" text on sign */}
          <mesh position={[0, 0.05, 0.012]}>
            <boxGeometry args={[0.25, 0.04, 0.002]} />
            <meshStandardMaterial 
              color="#ff0000"
              roughness={0.9}
            />
          </mesh>

          <mesh position={[0, -0.03, 0.012]}>
            <boxGeometry args={[0.22, 0.06, 0.002]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.9}
            />
          </mesh>

          {/* Chain holding sign */}
          <mesh position={[-0.12, 0.11, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>
          <mesh position={[0.12, 0.11, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Garden flowers */}
        {[-0.3, -0.15, 0.15, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.13, 0.5]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color={['#ff6b9d', '#ffd700', '#9c27b0', '#ff5722'][i]}
              emissive={['#ff6b9d', '#ffd700', '#9c27b0', '#ff5722'][i]}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Warning chain around property */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].map((angle, i) => (
          <mesh 
            key={i}
            position={[Math.cos(angle) * 0.6, 0.15, Math.sin(angle) * 0.6]}
            rotation={[0, angle + Math.PI / 4, 0]}
          >
            <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
            <meshStandardMaterial 
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.4, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Tax Form/Government Building Component
function TaxForm({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Government building base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.7]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.8}
          />
        </mesh>

        {/* Columns */}
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.65, -0.3]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.7, 32]} />
            <meshStandardMaterial 
              color={hovered ? "#d4d4d4" : "#c0c0c0"}
              roughness={0.3}
              metalness={0.3}
            />
          </mesh>
        ))}

        {/* Main building body */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.65, 0.8, 0.55]} />
          <meshStandardMaterial 
            color={hovered ? "#4a5568" : "#2d3748"}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* Tax form scroll on pedestal */}
        <mesh position={[0, 0.4, 0.35]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 32]} />
          <meshStandardMaterial 
            color="#8b4513"
            roughness={0.7}
          />
        </mesh>

        {/* Document scroll */}
        <mesh position={[0, 0.55, 0.35]} rotation={[0, Math.PI / 6, 0]}>
          <boxGeometry args={[0.4, 0.001, 0.6]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.9}
          />
        </mesh>

        {/* "TAX" text on scroll */}
        <mesh position={[0, 0.55, 0.65]} rotation={[0, Math.PI / 6, 0]}>
          <boxGeometry args={[0.25, 0.002, 0.08]} />
          <meshStandardMaterial 
            color="#ff0000"
            roughness={0.9}
          />
        </mesh>

        {/* Government seal */}
        <mesh position={[0, 0.87, 0.28]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
          <meshStandardMaterial 
            color="#003366"
            emissive="#003366"
            emissiveIntensity={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Building windows */}
        {[0.4, 0.9].map((y, floor) => (
          <group key={floor}>
            {[-0.2, 0.2].map((x, i) => (
              <mesh key={i} position={[x, y, 0.28]}>
                <boxGeometry args={[0.15, 0.15, 0.01]} />
                <meshStandardMaterial 
                  color="#87ceeb"
                  roughness={0.1}
                  metalness={0.9}
                  emissive="#b0d4f1"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Building entrance */}
        <mesh position={[0, 0.37, 0.28]}>
          <boxGeometry args={[0.2, 0.4, 0.01]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.8}
          />
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Calculator with Bills Component
function AccruedExpensesCalculator({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Desk surface */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.2, 0.08, 0.9]} />
          <meshStandardMaterial 
            color="#6b4423"
            roughness={0.7}
          />
        </mesh>

        {/* Calculator base */}
        <mesh position={[0.3, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.225, 0.375]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Calculator screen */}
        <mesh position={[0.3, 0.43, 0.189]}>
          <boxGeometry args={[0.375, 0.075, 0.01]} />
          <meshStandardMaterial 
            color="#001a00"
            emissive="#00ff00"
            emissiveIntensity={isSelected ? 0.8 : 0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Calculator buttons */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <mesh 
              key={`btn-${row}-${col}`}
              position={[0.3 + (col - 1) * 0.075, 0.38, 0.195 + row * 0.06]}
            >
              <boxGeometry args={[0.0525, 0.012, 0.045]} />
              <meshStandardMaterial 
                color="#4a4a4a"
                roughness={0.6}
              />
            </mesh>
          ))
        )}

        {/* Stack of bills */}
        {[0, 1, 2, 3].map((i) => {
          const colors = ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0'];
          return (
            <mesh 
              key={i}
              position={[-0.225, 0.25 + i * 0.004, 0.225]} 
              rotation={[0, 0, i * 0.05]}
              castShadow
            >
              <boxGeometry args={[0.525, 0.003, 0.375]} />
              <meshStandardMaterial 
                color={colors[i]}
                roughness={0.9}
              />
            </mesh>
          );
        })}

        {/* Top bill with amount */}
        <mesh position={[-0.225, 0.265, 0.225]} castShadow>
          <boxGeometry args={[0.525, 0.003, 0.375]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.9}
          />
        </mesh>

        {/* Amount text on bill */}
        <mesh position={[-0.225, 0.266, 0.39]}>
          <boxGeometry args={[0.225, 0.003, 0.045]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.3}
            roughness={0.9}
          />
        </mesh>

        {/* Pen */}
        <mesh position={[-0.525, 0.22, 0.3]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 16]} />
          <meshStandardMaterial 
            color="#0066cc"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Receipt roll */}
        <mesh position={[0.6, 0.25, -0.225]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.8}
          />
        </mesh>

        {/* Warning alert */}
        <mesh position={[-0.35, 0.6, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial 
            color="#ff6b00"
            emissive="#ff6b00"
            emissiveIntensity={isSelected ? 1 : 0.5}
          />
          {isSelected && <pointLight intensity={0.5} distance={2} color="#ff6b00" />}
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.0, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Promissory Note/IOU Component
function PromissoryNote({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const noteRef = useRef();

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

    // Floating note animation
    if (noteRef.current && isSelected) {
      noteRef.current.position.y = 1.05 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      noteRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Standing frame */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.12, 0.75, 0.12]} />
          <meshStandardMaterial 
            color="#8b7355"
            roughness={0.8}
          />
        </mesh>

        {/* Note paper */}
        <mesh ref={noteRef} position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.75, 0.525, 0.003]} />
          <meshStandardMaterial 
            color={hovered ? "#ffffcc" : "#ffffe6"}
            roughness={0.9}
          />
        </mesh>

        {/* Note border */}
        <mesh position={[0, 1.05, 0.004]}>
          <boxGeometry args={[0.72, 0.495, 0.002]} />
          <meshStandardMaterial 
            color="#8b7355"
            roughness={0.9}
          />
        </mesh>

        {/* "IOU" heading */}
        <mesh position={[0, 1.23, 0.004]}>
          <boxGeometry args={[0.225, 0.06, 0.001]} />
          <meshStandardMaterial 
            color="#8b0000"
            roughness={0.9}
          />
        </mesh>

        {/* Handwritten text lines */}
        {[1.125, 1.035, 0.945].map((y, i) => (
          <mesh key={i} position={[0, y, 0.004]}>
            <boxGeometry args={[0.6, 0.015, 0.001]} />
            <meshStandardMaterial 
              color="#4a4a4a"
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Amount */}
        <mesh position={[0.15, 0.885, 0.004]}>
          <boxGeometry args={[0.18, 0.03, 0.001]} />
          <meshStandardMaterial 
            color="#006400"
            emissive="#006400"
            emissiveIntensity={0.3}
            roughness={0.9}
          />
        </mesh>

        {/* Signature line */}
        <mesh position={[-0.15, 0.855, 0.004]}>
          <boxGeometry args={[0.3, 0.015, 0.001]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.9}
          />
        </mesh>

        {/* Broken seal */}
        <mesh position={[-0.225, 1.125, 0.004]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.06, 0.06, 0.003, 32]} />
          <meshStandardMaterial 
            color="#8b0000"
            roughness={0.7}
          />
        </mesh>

        {/* Crumpled paper effect */}
        {[-0.225, 0, 0.225].map((x, i) => (
          <mesh key={i} position={[x, 1.058, 0.001]} rotation={[0, 0, i * 0.02]}>
            <boxGeometry args={[0.03, 0.03, 0.001]} />
            <meshStandardMaterial 
              color="#d0d0d0"
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Warning light */}
        <mesh position={[0.45, 1.35, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial 
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={isSelected ? 1 : 0.5}
          />
          {isSelected && <pointLight intensity={0.3} distance={2} color="#ff4444" />}
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.65, 0]} fontSize={0.25} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Stock Market Display Component (for Investments)
function StockMarketDisplay({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
  const groupRef = useRef();
  const floatingRef = useFloatingAnimation(0.8, 0.05);
  const [hovered, setHovered] = useState(false);
  const chartLineRef = useRef();

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

    // Animated stock chart line
    if (chartLineRef.current && isSelected) {
      chartLineRef.current.position.y = 1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

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
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Monitor stand base */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.1, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Monitor stand arm */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Monitor screen */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[1.2, 0.75, 0.05]} />
          <meshStandardMaterial 
            color={hovered ? "#1a3a1a" : "#0a1a0a"}
            roughness={0.2}
            metalness={0.6}
            emissive="#00ff00"
            emissiveIntensity={isSelected ? 0.5 : 0.3}
          />
        </mesh>

        {/* Screen frame */}
        <mesh position={[0, 0.8, 0.03]}>
          <boxGeometry args={[1.25, 0.8, 0.02]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Stock chart grid lines */}
        {[0.65, 0.75, 0.85, 0.95].map((y, i) => (
          <mesh key={i} position={[0, y, 0.03]}>
            <boxGeometry args={[1.0, 0.001, 0.01]} />
            <meshStandardMaterial 
              color="#003300"
              emissive="#00aa00"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}

        {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.8, 0.03]}>
            <boxGeometry args={[0.001, 0.6, 0.01]} />
            <meshStandardMaterial 
              color="#003300"
              emissive="#00aa00"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}

        {/* Animated stock chart line */}
        <group ref={chartLineRef} position={[0, 1.1, 0.03]}>
          <mesh>
            <boxGeometry args={[0.9, 0.01, 0.01]} />
            <meshStandardMaterial 
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={isSelected ? 0.8 : 0.5}
            />
          </mesh>
          {/* Chart data points */}
          {[-0.4, -0.15, 0.075, 0.3].map((x, i) => (
            <mesh key={i} position={[x, i % 2 === 0 ? 0.1 : -0.1, 0]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial 
                color="#00ff00"
                emissive="#00ff00"
                emissiveIntensity={1}
              />
            </mesh>
          ))}
        </group>

        {/* Stock ticker symbols */}
        {["AAPL", "GOOGL", "MSFT"].map((symbol, i) => (
          <mesh key={i} position={[-0.45 + i * 0.225, 0.98, 0.03]}>
            <boxGeometry args={[0.15, 0.03, 0.01]} />
            <meshStandardMaterial 
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Price indicators */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.5 + i * 0.375, 0.58, 0.03]}>
            <boxGeometry args={[0.075, 0.022, 0.01]} />
            <meshStandardMaterial 
              color={i === 0 ? "#ff0000" : "#00ff00"}
              emissive={i === 0 ? "#ff0000" : "#00ff00"}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Green/red status lights */}
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 1.08, 0.03]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial 
              color={i === 0 ? "#00ff00" : "#ff0000"}
              emissive={i === 0 ? "#00ff00" : "#ff0000"}
              emissiveIntensity={isSelected ? 1 : 0.5}
            />
          </mesh>
        ))}

        {/* Monitor base/stand bottom */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.3, 0.05, 32]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
              <meshStandardMaterial 
                color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
              />
            </mesh>
          </>
        )}

        <RippleEffect 
          position={[0, 0.01, 0]} 
          visible={isSelected && clickCount > 0}
          color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
        />

        <Text position={[0, 1.45, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000">
          {name}
        </Text>

        {isSelected && (
          <Text position={[0, -0.3, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" fontWeight="bold">
            {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
          </Text>
        )}

        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          ${balance.toFixed(2)}
        </Text>
      </group>
    </group>
  );
}

// Stylized Tree Component (replacing boxes)
function TreeAccount({ name, position, scale, onSelect, isSelected, clickCount, isAsset, balance = 0 }) {
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

  // Color logic: Keep original colors when viewing, only change in journal mode
  const baseColor = isAsset ? '#2d5016' : '#8b4513'; // Green for assets, brown for liabilities
  const foliageColor = isAsset ? '#4a7c3c' : '#cd853f'; // Consistent foliage colors
  const selectedColor = isSelected ? (clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b') : (isAsset ? '#6ea057' : '#d2691e');

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Floating animation */}
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

      {/* Foliage - Bottom layer */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? (isAsset ? '#5a8f45' : '#daa520') : foliageColor}
          roughness={0.7}
          emissive={isSelected ? selectedColor : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Foliage - Middle layer */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? (isAsset ? '#5a8f45' : '#daa520') : foliageColor}
          roughness={0.7}
          emissive={isSelected ? selectedColor : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Foliage - Top layer */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? (isAsset ? '#5a8f45' : '#daa520') : foliageColor}
          roughness={0.7}
          emissive={isSelected ? selectedColor : '#000000'}
          emissiveIntensity={isSelected ? 0.1 : 0}
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <>
        <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[1.3, 1.4, 0.08, 32]} />
          <meshStandardMaterial 
            color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
            emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissiveIntensity={0.8}
          />
        </mesh>
          {/* Glowing ring around the tree */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
            <meshStandardMaterial 
              color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
              emissive={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
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

      {/* Ripple effect on click */}
      <RippleEffect 
        position={[0, 0.01, 0]} 
        visible={isSelected && clickCount > 0}
        color={clickCount === 1 ? '#4ecdc4' : clickCount === 2 ? '#ff6b6b' : '#9b9b9b'}
      />

       {/* Label */}
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

       {/* Status indicator */}
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
           {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : clickCount === 3 ? 'NONE' : ''}
         </Text>
       )}

       {/* Balance indicator */}
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





// Decorative Tree (non-interactive background element)
function DecorativeTree({ position, scale = 1, treeType = 'pine' }) {
  if (treeType === 'pine') {
    return (
      <group position={position}>
        <mesh position={[0, 0.3 * scale, 0]}>
          <cylinderGeometry args={[0.08 * scale, 0.12 * scale, 0.6 * scale, 8]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.8 * scale, 0]}>
          <coneGeometry args={[0.4 * scale, 0.7 * scale, 8]} />
          <meshStandardMaterial color="#2d5016" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.2 * scale, 0]}>
          <coneGeometry args={[0.35 * scale, 0.6 * scale, 8]} />
          <meshStandardMaterial color="#365e1f" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.55 * scale, 0]}>
          <coneGeometry args={[0.28 * scale, 0.5 * scale, 8]} />
          <meshStandardMaterial color="#4a7c3c" roughness={0.8} />
        </mesh>
      </group>
    );
  } else {
    
    return (
      <group position={position}>
        <mesh position={[0, 0.4 * scale, 0]}>
          <cylinderGeometry args={[0.1 * scale, 0.15 * scale, 0.8 * scale, 8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.0 * scale, 0]}>
          <sphereGeometry args={[0.45 * scale, 16, 16]} />
          <meshStandardMaterial color="#4a7c3c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.15 * scale, 0.9 * scale, 0]}>
          <sphereGeometry args={[0.35 * scale, 16, 16]} />
          <meshStandardMaterial color="#3d6b2f" roughness={0.8} />
        </mesh>
        <mesh position={[0.15 * scale, 0.95 * scale, 0]}>
          <sphereGeometry args={[0.4 * scale, 16, 16]} />
          <meshStandardMaterial color="#5a8f45" roughness={0.8} />
        </mesh>
      </group>
    );
  }
}



// Bush/Shrub Component
function Bush({ position, scale = 1 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2 * scale, 0]}>
        <sphereGeometry args={[0.3 * scale, 16, 16]} />
        <meshStandardMaterial color="#4a7c3c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.15 * scale, 0.15 * scale, 0.1 * scale]}>
        <sphereGeometry args={[0.25 * scale, 16, 16]} />
        <meshStandardMaterial color="#3d6b2f" roughness={0.9} />
      </mesh>
      <mesh position={[0.15 * scale, 0.18 * scale, -0.1 * scale]}>
        <sphereGeometry args={[0.28 * scale, 16, 16]} />
        <meshStandardMaterial color="#5a8f45" roughness={0.9} />
      </mesh>
    </group>
  );
}



// Fountain Component
function Fountain({ position }) {
  const waterRef = useRef();
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.3, 32]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.9, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Water */}
      <mesh ref={waterRef} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.85, 0.75, 0.08, 32]} />
        <meshStandardMaterial 
          color="#4dd0e1" 
          transparent 
          opacity={0.6}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      {/* Top sphere */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

// Bench Component
function Bench({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.7, -0.15]}>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[[-0.5, 0.2, 0.15], [0.5, 0.2, 0.15], [-0.5, 0.2, -0.15], [0.5, 0.2, -0.15]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#6b5639" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Lamp Post Component
function LampPost({ position }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Top fixture */}
      <mesh position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Light bulb */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Point light */}
      <pointLight position={[0, 3, 0]} intensity={0.5} distance={5} color="#ffd700" />
    </group>
  );
}

// Topiary/Sculpted Bush Component
function Topiary({ position, shape = 'sphere' }) {
  return (
    <group position={position}>
      {/* Base pot */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Shaped foliage */}
      {shape === 'sphere' ? (
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#2d5016" roughness={0.8} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 1.0, 0]}>
            <coneGeometry args={[0.35, 0.5, 8]} />
            <meshStandardMaterial color="#2d5016" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.28, 0.4, 8]} />
            <meshStandardMaterial color="#2d5016" roughness={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Stepping Stones Component
function SteppingStones({ startPos, endPos, count = 5 }) {
  const stones = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = startPos[0] + (endPos[0] - startPos[0]) * t;
    const z = startPos[1] + (endPos[1] - startPos[1]) * t;
    stones.push(
      <mesh key={i} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
        <circleGeometry args={[0.25, 8]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.9} />
      </mesh>
    );
  }
  return <>{stones}</>;
}

// Decorative Rocks/Stones Component
function RockCluster({ position, count = 3 }) {
  return (
    <group position={position}>
      {[...Array(count)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 0.6,
            0.08,
            (Math.random() - 0.5) * 0.6
          ]}
          rotation={[
            Math.random() * 0.3,
            Math.random() * Math.PI * 2,
            Math.random() * 0.3
          ]}
        >
          <dodecahedronGeometry args={[0.1 + Math.random() * 0.1, 0]} />
          <meshStandardMaterial color="#808080" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// Flower bed Component
function FlowerBed({ position, width = 2, depth = 0.5 }) {
  return (
    <group position={position}>
      {/* Bed base */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      {/* Flowers */}
      {[...Array(Math.floor(width * 3))].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * width * 0.9,
            0.15,
            (Math.random() - 0.5) * depth * 0.9
          ]}
        >
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial 
            color={['#ff6b9d', '#ffd700', '#9c27b0', '#ff5722'][Math.floor(Math.random() * 4)]}
            emissive={['#ff6b9d', '#ffd700', '#9c27b0', '#ff5722'][Math.floor(Math.random() * 4)]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Garden Path Component
function GardenPath({ position, width, length }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
    </mesh>
  );
}

// White Railing/Fence Component
function Railing({ position, width, orientation = 'horizontal' }) {
  const rotation = orientation === 'horizontal' ? [0, 0, 0] : [0, Math.PI / 2, 0];
  
  return (
    <group position={position} rotation={rotation}>
      {/* Posts */}
      {[...Array(Math.floor(width / 1.5) + 1)].map((_, i) => (
        <mesh key={i} position={[-width/2 + i * 1.5, 0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
        </mesh>
      ))}
      {/* Top rail */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[width, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[width, 0.06, 0.06]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Camera Controller Component
function CameraController({ position, target }) {
  const { camera } = useThree();
  const [lastPosition, setLastPosition] = useState(null);
  const [lastTarget, setLastTarget] = useState(null);
  
  // Only move camera when position/target actually changes
  useEffect(() => {
    const positionStr = JSON.stringify(position);
    const targetStr = JSON.stringify(target);
    
    if (camera && (positionStr !== lastPosition || targetStr !== lastTarget)) {
      const targetPosition = new THREE.Vector3(...position);
      camera.position.copy(targetPosition);
      camera.lookAt(...target);
      setLastPosition(positionStr);
      setLastTarget(targetStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, target]);
  
  return null;
}

// Main Scene Component
function Scene({ selectedAccount, setSelectedAccount, clickCounts, setClickCounts, isJournalMode, accountBalances, onAccountInfoClick, cameraPosition, cameraTarget, rainIntensity }) {
  const handleTreeClick = (accountName, isAsset) => {
    if (!isJournalMode) {
      // Show account info when not in journal mode
      onAccountInfoClick(accountName, isAsset);
      return;
    }
    
    const currentCount = clickCounts[accountName] || 0;
    
    if (currentCount === 3) {
      // Reset this account and clear selection (cycling back to 0)
      setClickCounts(prev => ({ ...prev, [accountName]: 0 }));
      setSelectedAccount(null);
    } else if (selectedAccount === accountName) {
      // Increment click count for same account
      setClickCounts(prev => ({ ...prev, [accountName]: currentCount + 1 }));
    } else {
      // Select new account and reset all others
      setClickCounts(prev => {
        const newCounts = {};
        // Reset all other accounts
        [...assetAccounts, ...liabilityAccounts].forEach(acc => {
          if (acc.name !== accountName) {
            newCounts[acc.name] = 0;
          }
        });
        // Set new account to 1
        newCounts[accountName] = 1;
        return newCounts;
      });
      setSelectedAccount(accountName);
    }
  };

  return (
    <>
      {/* Camera Controller */}
      <CameraController position={cameraPosition} target={cameraTarget} />
      
      {/* Atmospheric Effects */}
      <Sky 
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={10}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      {/* Rain System */}
      {rainIntensity > 0 && (
        <RainSystem intensity={rainIntensity} speed={rainIntensity} />
      )}
      
      {/* Stars */}
      <Stars 
        radius={300} 
        depth={60} 
        count={20000} 
        factor={7} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Clouds removed */}

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.6} color="#f0f8ff" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        color="#ffffff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.8} color="#e6f3ff" />
      <hemisphereLight args={['#ffffff', '#87ceeb', 0.8]} />
      
      {/* Point lights for ambiance */}
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffd700" distance={30} />
      <pointLight position={[-15, 5, 0]} intensity={0.2} color="#98fb98" distance={25} />
      <pointLight position={[15, 5, 0]} intensity={0.2} color="#f0e68c" distance={25} />
      
      {/* Ground - white/light gray */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>

      {/* Grid lines for structure */}
      <gridHelper args={[40, 40, '#4a7c3c', '#4a7c3c']} position={[0, 0.01, 0]} />

      {/* Fog for depth perception
      <fog attach="fog" args={['#87ceeb', 10, 50]} /> */}

      {/* Central pathway */}
      <GardenPath position={[0, 0.02, 0]} width={2.5} length={18} />

      {/* Decorative paths */}
      <GardenPath position={[-6, 0.02, 0]} width={1.5} length={12} />
      <GardenPath position={[6, 0.02, 0]} width={1.5} length={12} />

      {/* ASSET SIDE (Left) - Green/Natural tones */}
      <group>
        {/* Account objects */}
        {assetAccounts.map((account, index) => {
          const commonProps = {
            key: `asset-${account.name}-${index}`,
            name: account.name,
            position: account.position,
            scale: account.scale,
            rotation: account.rotation || 0,
            onSelect: () => handleTreeClick(account.name, true),
            isSelected: selectedAccount === account.name,
            clickCount: clickCounts[account.name] || 0,
            isAsset: true,
            balance: accountBalances[account.name] || 0
          };

          if (account.type === 'bank') {
            return <BankBuilding {...commonProps} />;
          } else if (account.type === 'lorry') {
            return <LorryAccount {...commonProps} />;
          } else if (account.type === 'safe') {
            return <SafeVault {...commonProps} />;
          } else if (account.type === 'warehouse') {
            return <WarehouseContainer {...commonProps} />;
          } else if (account.type === 'machine') {
            return <IndustrialMachine {...commonProps} />;
          } else if (account.type === 'office') {
            return <OfficeBuilding {...commonProps} />;
          } else if (account.type === 'creditcard') {
            return <CreditCard {...commonProps} />;
          } else if (account.type === 'document') {
            return <LegalDocument {...commonProps} />;
          } else if (account.type === 'invoice') {
            return <InvoiceStack {...commonProps} />;
          } else if (account.type === 'house') {
            return <MortgageHouse {...commonProps} />;
          } else if (account.type === 'tax') {
            return <TaxForm {...commonProps} />;
          } else if (account.type === 'accrued') {
            return <AccruedExpensesCalculator {...commonProps} />;
          } else if (account.type === 'iou') {
            return <PromissoryNote {...commonProps} />;
          } else if (account.type === 'stock') {
            return <StockMarketDisplay {...commonProps} />;
          } else {
            return <TreeAccount {...commonProps} />;
          }
        })}
{/* 
        Decorative background trees */}
        <DecorativeTree position={[-10, 0, 4]} scale={1.3} treeType="pine" />
        <DecorativeTree position={[-10, 0, -4]} scale={1.1} treeType="round" />
        <DecorativeTree position={[-2, 0, -5]} scale={0.9} treeType="pine" />
        <DecorativeTree position={[-2, 0, 5]} scale={1.0} treeType="round" />
        <DecorativeTree position={[-9, 0, 0]} scale={0.8} treeType="pine" />
        
        {/* Bushes */}
        <Bush position={[-3, 0, 3]} scale={0.9} />
        <Bush position={[-7, 0, -3]} scale={0.7} />
        <Bush position={[-5, 0, 5]} scale={0.6} />
        <Bush position={[-9, 0, 1]} scale={0.8} />

        {/* Flower beds */}
        <FlowerBed position={[-5, 0, -4]} width={2} depth={0.5} />
        <FlowerBed position={[-8, 0, 4]} width={1.8} depth={0.5} />
        <FlowerBed position={[-3, 0, 0]} width={1.5} depth={0.4} />

         {/* Railings */}
         <Railing position={[-11, 0, 0]} width={10} orientation="vertical" />
         <Railing position={[-6, 0, 6]} width={10} orientation="horizontal" />
         <Railing position={[-6, 0, -6]} width={10} orientation="horizontal" />
         
         {/* Advanced Decorative Elements */}
        <Fountain position={[-12, 0, 0]} />
        <Bench position={[-9, 0, -3]} rotation={-Math.PI/4} />
        <LampPost position={[-7, 0, 5]} />
        <Topiary position={[-5, 0, -1]} shape="sphere" />
        <RockCluster position={[-3, 0, 2]} count={3} />
        <SteppingStones startPos={[-2, 0]} endPos={[-8, 0]} count={5} />
       </group>

      {/* LIABILITY SIDE (Right) - Brown/Earth tones */}
      <group>
        {/* Account objects */}
        {liabilityAccounts.map((account, index) => {
          const commonProps = {
            key: `liability-${account.name}-${index}`,
            name: account.name,
            position: account.position,
            scale: account.scale,
            rotation: account.rotation || 0,
            onSelect: () => handleTreeClick(account.name, false),
            isSelected: selectedAccount === account.name,
            clickCount: clickCounts[account.name] || 0,
            isAsset: false,
            balance: accountBalances[account.name] || 0
          };

          if (account.type === 'bank') {
            return <BankBuilding {...commonProps} />;
          } else if (account.type === 'lorry') {
            return <LorryAccount {...commonProps} />;
          } else if (account.type === 'safe') {
            return <SafeVault {...commonProps} />;
          } else if (account.type === 'warehouse') {
            return <WarehouseContainer {...commonProps} />;
          } else if (account.type === 'machine') {
            return <IndustrialMachine {...commonProps} />;
          } else if (account.type === 'office') {
            return <OfficeBuilding {...commonProps} />;
          } else if (account.type === 'creditcard') {
            return <CreditCard {...commonProps} />;
          } else if (account.type === 'document') {
            return <LegalDocument {...commonProps} />;
          } else if (account.type === 'invoice') {
            return <InvoiceStack {...commonProps} />;
          } else if (account.type === 'house') {
            return <MortgageHouse {...commonProps} />;
          } else if (account.type === 'tax') {
            return <TaxForm {...commonProps} />;
          } else if (account.type === 'accrued') {
            return <AccruedExpensesCalculator {...commonProps} />;
          } else if (account.type === 'iou') {
            return <PromissoryNote {...commonProps} />;
          } else if (account.type === 'stock') {
            return <StockMarketDisplay {...commonProps} />;
          } else {
            return <TreeAccount {...commonProps} />;
          }
        })}

        {/* Decorative background trees */}
        <DecorativeTree position={[10, 0, 4]} scale={1.2} treeType="round" />
        <DecorativeTree position={[10, 0, -4]} scale={1.0} treeType="pine" />
        <DecorativeTree position={[2, 0, -5]} scale={0.8} treeType="pine" />
        <DecorativeTree position={[2, 0, 4]} scale={0.9} treeType="round" />
        
        {/* Bushes */}
        <Bush position={[9, 0, 0]} scale={0.8} />
        <Bush position={[3, 0, -3]} scale={0.6} />
        <Bush position={[5, 0, 5]} scale={0.7} />

        {/* Flower beds */}
        <FlowerBed position={[8, 0, 0]} width={1.5} depth={0.4} />
        <FlowerBed position={[4, 0, -4]} width={1.2} depth={0.4} />

        {/* Railings */}
        <Railing position={[11, 0, 0]} width={10} orientation="vertical" />
        <Railing position={[6, 0, 6]} width={10} orientation="horizontal" />
        <Railing position={[6, 0, -6]} width={10} orientation="horizontal" />
        
        {/* Advanced Decorative Elements */}

         <Bench position={[9, 0, 3]} rotation={Math.PI/4} />
         <LampPost position={[7, 0, -5]} />
         <Topiary position={[5, 0, 1]} shape="cone" />
         <RockCluster position={[3, 0, -2]} count={4} />
         <SteppingStones startPos={[8, 0]} endPos={[2, 0]} count={6} />
      </group>

      {/* CENTRAL DECORATIVE AREA */}
      <group>
        {/* Central fountain */}
        <Fountain position={[0, 0, 0]} />
        

        
        {/* Benches */}
        <Bench position={[-3, 0, 6]} rotation={Math.PI} />
        <Bench position={[3, 0, 6]} rotation={Math.PI} />
        <Bench position={[-3, 0, -6]} rotation={0} />
        <Bench position={[3, 0, -6]} rotation={0} />
        
        {/* Lamp posts */}
        <LampPost position={[-10, 0, 6]} />
        <LampPost position={[10, 0, 6]} />
        <LampPost position={[-10, 0, -6]} />
        <LampPost position={[10, 0, -6]} />
        <LampPost position={[0, 0, 8]} />
        <LampPost position={[0, 0, -8]} />
        
        {/* Topiary decorations */}
        <Topiary position={[-1.5, 0, 1.5]} shape="sphere" />
        <Topiary position={[1.5, 0, 1.5]} shape="cone" />
        <Topiary position={[-1.5, 0, -1.5]} shape="cone" />
        <Topiary position={[1.5, 0, -1.5]} shape="sphere" />
        
        {/* Stepping stones */}
        <SteppingStones startPos={[-10, -8]} endPos={[-4, -4]} count={6} />
        <SteppingStones startPos={[10, -8]} endPos={[4, -4]} count={6} />
        <SteppingStones startPos={[-10, 8]} endPos={[-4, 4]} count={6} />
        <SteppingStones startPos={[10, 8]} endPos={[4, 4]} count={6} />
        
        {/* Rock clusters */}
        <RockCluster position={[-8, 0, 5]} count={4} />
        <RockCluster position={[8, 0, -5]} count={3} />
        <RockCluster position={[-5, 0, -5]} count={3} />
        <RockCluster position={[5, 0, 5]} count={4} />
      </group>

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        maxPolarAngle={Math.PI}
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        keys={{
          LEFT: 'ArrowLeft',
          UP: 'ArrowUp', 
          RIGHT: 'ArrowRight',
          BOTTOM: 'ArrowDown'
        }}
      />
    </>
  );
}

// Journal Panel Component
function JournalPanel({ currentJournal, onAddEntry, onCloseJournal, onCompleteJournal, clickCount }) {
  const [amount, setAmount] = useState('');

  const handleAddEntry = () => {
    if (amount && !isNaN(amount) && currentJournal.selectedAccount && clickCount !== 3) {
      const transactionType = clickCount === 1 ? 'debit' : 'credit';
      
      onAddEntry({
        account: currentJournal.selectedAccount,
        type: transactionType,
        amount: parseFloat(amount)
      });
      setAmount('');
    }
  };

  if (!currentJournal) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '20px',
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      minWidth: '420px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 1000,
      border: '2px solid #e0e0e0'
    }}>
      <h3 style={{ marginTop: 0, color: '#333', fontSize: '24px', fontWeight: 'bold' }}>
        📋 Journal Entry #{currentJournal.id}
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#555' }}>Current Entries:</h4>
        {currentJournal.entries.length === 0 ? (
          <p style={{ color: '#999' }}>No entries yet</p>
        ) : (
          currentJournal.entries.map((entry, idx) => (
            <div key={idx} style={{
              padding: '12px',
              marginBottom: '8px',
              background: entry.type === 'credit' ? '#ffebee' : '#e8f5e9',
              borderRadius: '8px',
              fontSize: '14px',
              border: entry.type === 'credit' ? '1px solid #ef9a9a' : '1px solid #a5d6a7'
            }}>
              <strong>{entry.account}</strong>: {entry.type === 'credit' ? `($${entry.amount.toFixed(2)})` : `+$${entry.amount.toFixed(2)}`}
            </div>
          ))
        )}
      </div>


      {currentJournal.selectedAccount && (
        <>
          <h4 style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '5px 10px',
              background: '#4caf50',
              color: 'white',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              SELECTED
            </span>
            Add Entry for: {currentJournal.selectedAccount}
          </h4>
          <div style={{
            padding: '12px',
            marginBottom: '15px',
            background: clickCount === 1 ? '#e8f5e9' : clickCount === 2 ? '#ffebee' : '#f5f5f5',
            borderRadius: '8px',
            border: `2px solid ${clickCount === 1 ? '#4caf50' : clickCount === 2 ? '#f44336' : '#9b9b9b'}`
          }}>
            <strong>Transaction Type: </strong>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: clickCount === 1 ? '#4caf50' : clickCount === 2 ? '#f44336' : '#9b9b9b' }}>
              {clickCount === 1 ? '📈 Debit (+)' : clickCount === 2 ? '📉 Credit (-)' : '⚪ No Entry'}
            </span>
          </div>
          {clickCount === 3 && (
            <div style={{
              padding: '12px',
              marginBottom: '15px',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '2px solid #ffc107',
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ This account is set to "None" - no entry will be added
            </div>
          )}
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '16px'
            }}
          />
          <button
            onClick={handleAddEntry}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ➕ Add Entry
          </button>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onCompleteJournal}
          style={{
            flex: 1,
            padding: '12px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ✅ Complete
        </button>
        <button
          onClick={onCloseJournal}
          style={{
            flex: 1,
            padding: '12px',
            background: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ❌ Close
        </button>
      </div>
    </div>
  );
}

// Journal Display Component
function JournalDisplay({ journalEntries }) {
  const [expandedJournal, setExpandedJournal] = useState(null);

  const toggleJournal = (journalId) => {
    setExpandedJournal(expandedJournal === journalId ? null : journalId);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'white',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000,
      border: '2px solid #e0e0e0'
    }}>
      <h4 style={{ marginTop: 0, color: '#333' }}>📚 Journal Entries</h4>
      {journalEntries.length === 0 ? (
        <p style={{ color: '#999' }}>No journal entries yet</p>
      ) : (
        journalEntries.map((journal) => (
          <div key={journal.id} style={{
            marginBottom: '10px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div 
              onClick={() => toggleJournal(journal.id)}
              style={{
                padding: '12px',
                background: '#f5f5f5',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span>Journal #{journal.id}</span>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                  {new Date(journal.timestamp).toLocaleString()}
                </span>
              </div>
              <span>{expandedJournal === journal.id ? '▼' : '▶'}</span>
            </div>
            
            {expandedJournal === journal.id && (
              <div style={{ padding: '12px', background: 'white' }}>
                {journal.entries.map((entry, idx) => (
                  <div key={idx} style={{
                    padding: '8px',
                    marginBottom: '5px',
                    background: entry.type === 'credit' ? '#ffebee' : '#e8f5e9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    border: entry.type === 'credit' ? '1px solid #ef9a9a' : '1px solid #a5d6a7'
                  }}>
                    <strong>{entry.account}</strong>: {entry.type === 'credit' ? `($${entry.amount.toFixed(2)})` : `+$${entry.amount.toFixed(2)}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Account Details Modal
function AccountDetailsModal({ isVisible, type, accounts, onClose }) {
  if (!isVisible) return null;

  const totalAmount = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: `3px solid ${type === 'assets' ? '#4a7c3c' : '#cd853f'}`,
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            {type === 'assets' ? '💰' : '📋'} {type === 'assets' ? 'ASSET ACCOUNTS' : 'LIABILITY ACCOUNTS'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Total Summary */}
        <div style={{
          padding: '20px',
          background: type === 'assets' ? '#e8f5e9' : '#fff3e0',
          borderRadius: '15px',
          marginBottom: '20px',
          border: `3px solid ${type === 'assets' ? '#4a7c3c' : '#cd853f'}`,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            Total {type === 'assets' ? 'Assets' : 'Liabilities'}
          </h3>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: type === 'assets' ? '#4caf50' : '#f44336'
          }}>
            ${totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Individual Accounts */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Account Breakdown</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {accounts.map((account, index) => (
              <div key={index} style={{
                padding: '15px',
                marginBottom: '10px',
                background: account.balance >= 0 ? '#e8f5e9' : '#ffebee',
                borderRadius: '10px',
                border: `2px solid ${account.balance >= 0 ? '#4caf50' : '#f44336'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                    {account.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {type === 'assets' ? 'Asset Account' : 'Liability Account'}
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: account.balance >= 0 ? '#4caf50' : '#f44336'
                }}>
                  ${account.balance.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Balance Dashboard
function BalanceDashboard({ accountBalances, journalEntries, onAssetClick, onLiabilityClick }) {
  const [expanded, setExpanded] = useState(false);
  
  const totalAssets = Object.entries(accountBalances)
    .filter(([name]) => assetAccounts.find(acc => acc.name === name))
    .reduce((sum, [, balance]) => sum + balance, 0);
    
  const totalLiabilities = Object.entries(accountBalances)
    .filter(([name]) => liabilityAccounts.find(acc => acc.name === name))
    .reduce((sum, [, balance]) => sum + balance, 0);
    
  // Animated values for smooth progress bar transitions
  const [animatedAssets, setAnimatedAssets] = useState(0);
  const [animatedLiabilities, setAnimatedLiabilities] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAssets(totalAssets);
      setAnimatedLiabilities(totalLiabilities);
    }, 100);
    return () => clearTimeout(timer);
  }, [totalAssets, totalLiabilities]);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'white',
      padding: '15px 25px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 999,
      border: '2px solid #e0e0e0',
      minWidth: '300px'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h4 style={{ margin: 0, color: '#333' }}>💰 Financial Summary</h4>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '15px' }}>
          <div 
            className="balance-item asset-item"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #e8f5e9 0%, rgba(76, 175, 80, 0.1) 100%)',
              border: '2px solid #4caf50',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
            }}
            onClick={onAssetClick}
          >
            <span style={{ 
              color: '#2e7d32', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>💰 Total Assets:</span>
            <span style={{ 
              color: totalAssets >= 0 ? '#1b5e20' : '#d32f2f', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>${totalAssets.toFixed(2)}</span>
          </div>
          
          {/* Progress bar for assets */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min(100, (animatedAssets / Math.max(animatedAssets + Math.abs(animatedLiabilities), 1)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
              borderRadius: '4px',
              transition: 'width 0.8s ease',
              boxShadow: '0 1px 3px rgba(76, 175, 80, 0.3)'
            }} />
          </div>
          <div 
            className="balance-item liability-item"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffebee 0%, rgba(244, 67, 54, 0.1) 100%)',
              border: '2px solid #f44336',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)'
            }}
            onClick={onLiabilityClick}
          >
            <span style={{ 
              color: '#c62828', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>📋 Total Liabilities:</span>
            <span style={{ 
              color: totalLiabilities >= 0 ? '#c62828' : '#2e7d32', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}>${totalLiabilities.toFixed(2)}</span>
          </div>
          
          {/* Progress bar for liabilities */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min(100, (Math.abs(animatedLiabilities) / Math.max(animatedAssets + Math.abs(animatedLiabilities), 1)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
              borderRadius: '4px',
              transition: 'width 0.8s ease',
              boxShadow: '0 1px 3px rgba(244, 67, 54, 0.3)'
            }} />
          </div>
          <div style={{ 
            borderTop: '2px solid #e0e0e0', 
            marginTop: '10px', 
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Net Worth:</span>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '16px',
              color: netWorth >= 0 ? '#4caf50' : '#f44336'
            }}>
              ${netWorth.toFixed(2)}
            </span>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            📊 Total Journals: {journalEntries.length}
          </div>
        </div>
      )}
    </div>
  );
}

// Journal Button Component
function JournalButton({ onJournalClick, isJournalMode }) {
  return (
    <button
      className="button-hover"
      onClick={onJournalClick}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '18px 35px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        borderRadius: '15px',
        cursor: 'pointer',
        zIndex: 1001,
        background: isJournalMode 
          ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' 
          : 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border: '3px solid rgba(255,255,255,0.2)'
      }}
    >
      {isJournalMode ? '🚪 EXIT ENTRY' : '➕ ADD ACCOUNT ENTRY'}
    </button>
  );
}

// Export/Import Panel
function ExportImportPanel({ journalEntries, accountBalances, onImport }) {
  const [showPanel, setShowPanel] = useState(false);

  const handleExport = () => {
    const data = {
      journalEntries,
      accountBalances,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-garden-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onImport(data);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          zIndex: 998,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        💾 Data
      </button>

      {showPanel && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '20px',
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          zIndex: 998,
          border: '2px solid #e0e0e0',
          minWidth: '250px'
        }}>
          <h4 style={{ marginTop: 0, color: '#333' }}>Data Management</h4>
          
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              padding: '10px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}
          >
            📤 Export Data
          </button>
          
          <label style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            📥 Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}
    </>
  );
}

// Account Info Panel Component
function AccountInfoPanel({ account, balance, isAsset, journalEntries, visible, onClose }) {
  if (!visible) return null;

  // Get last 3 transactions for this account
  const accountTransactions = journalEntries
    .flatMap(journal => journal.entries)
    .filter(entry => entry.account === account)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: `3px solid ${isAsset ? '#4a7c3c' : '#cd853f'}`,
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            {isAsset ? '💰' : '📋'} {account}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Account Type */}
        <div style={{
          padding: '10px 15px',
          background: isAsset ? '#e8f5e9' : '#fff3e0',
          borderRadius: '10px',
          marginBottom: '20px',
          border: `2px solid ${isAsset ? '#4a7c3c' : '#cd853f'}`
        }}>
          <strong style={{ color: isAsset ? '#4a7c3c' : '#cd853f' }}>
            {isAsset ? 'ASSET ACCOUNT' : 'LIABILITY ACCOUNT'}
          </strong>
        </div>

        {/* Current Balance */}
        <div style={{
          padding: '20px',
          background: balance >= 0 ? '#e8f5e9' : '#ffebee',
          borderRadius: '15px',
          marginBottom: '20px',
          border: `3px solid ${balance >= 0 ? '#4caf50' : '#f44336'}`,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Current Balance</h3>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: balance >= 0 ? '#4caf50' : '#f44336'
          }}>
            ${balance.toFixed(2)}
          </div>
        </div>

        {/* Last 3 Transactions */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Last 3 Transactions</h3>
          {accountTransactions.length === 0 ? (
            <div style={{
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '10px',
              textAlign: 'center',
              color: '#666',
              fontStyle: 'italic'
            }}>
              No transactions yet
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {accountTransactions.map((transaction, index) => (
                <div key={index} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: transaction.type === 'debit' ? '#e8f5e9' : '#ffebee',
                  borderRadius: '10px',
                  border: `2px solid ${transaction.type === 'debit' ? '#4caf50' : '#f44336'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {transaction.type === 'debit' ? '📈 Debit' : '📉 Credit'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: transaction.type === 'debit' ? '#4caf50' : '#f44336'
                  }}>
                    {transaction.type === 'debit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tooltip Component
function Tooltip({ account, balance, isAsset, position, visible }) {
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'absolute',
      left: position.x + 10,
      top: position.y - 10,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      zIndex: 1000,
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: `2px solid ${isAsset ? '#4a7c3c' : '#cd853f'}`,
      minWidth: '200px'
    }}>
      <div style={{ color: isAsset ? '#4a7c3c' : '#cd853f', marginBottom: '4px' }}>
        {isAsset ? '💰 ASSET' : '📋 LIABILITY'}
      </div>
      <div style={{ marginBottom: '8px' }}>{account}</div>
      <div style={{ 
        fontSize: '16px', 
        color: balance >= 0 ? '#4caf50' : '#f44336',
        borderTop: '1px solid #333',
        paddingTop: '8px'
      }}>
        Balance: ${balance.toFixed(2)}
      </div>
    </div>
  );
}

// Tutorial Component
function Tutorial({ isVisible, onClose, currentStep, onNext, onPrev }) {
  const steps = [
    {
      title: "Welcome to Accounting Garden! 🌳",
      content: "This is a 3D interactive accounting system. You can manage your financial accounts by clicking on the trees.",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "Account Types",
      content: "Green trees on the left are ASSETS (what you own). Brown trees on the right are LIABILITIES (what you owe).",
      position: { top: '30%', left: '20px' }
    },
    {
      title: "Creating Journal Entries",
      content: "Click 'START JOURNAL' to begin recording transactions. Then click on account trees to add debits and credits.",
      position: { top: '20px', right: '20px' }
    },
    {
      title: "Balancing Your Books",
      content: "Remember: Total Debits must equal Total Credits. The system will help you balance your entries.",
      position: { bottom: '20px', left: '20px' }
    }
  ];

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '3px solid #4caf50',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <h2 style={{ marginTop: 0, color: '#333', textAlign: 'center' }}>
          {step.title}
        </h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555', marginBottom: '30px' }}>
          {step.content}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            style={{
              padding: '10px 20px',
              background: currentStep === 0 ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={currentStep === steps.length - 1 ? onClose : onNext}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Camera Control Component
function CameraControls({ onCameraChange }) {
  const cameraPresets = [
    { name: '🎯 Default', position: [0, 12, 20], target: [0, 0, 0] },
    { name: '📐 Top View', position: [0, 25, 0], target: [0, 0, 0] },
    { name: '👈 Left Side', position: [-20, 10, 0], target: [0, 0, 0] },
    { name: '👉 Right Side', position: [20, 10, 0], target: [0, 0, 0] },
    { name: '🔍 Close Up', position: [0, 5, 8], target: [0, 0, 0] },
    { name: '🌅 Wide View', position: [0, 15, 30], target: [0, 0, 0] },
    { name: '📊 Assets Focus', position: [-8, 8, 12], target: [-4, 0, 0] },
    { name: '📋 Liabilities Focus', position: [8, 8, 12], target: [4, 0, 0] }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      zIndex: 1000,
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: '90vw'
    }}>
      {cameraPresets.map((preset, index) => (
        <button
          key={index}
          onClick={() => onCameraChange(preset.position, preset.target)}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white',
            borderRadius: '20px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.2)',
            minWidth: '80px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}

// Main App Component
export default function App() {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [clickCounts, setClickCounts] = useState({});
  const [isJournalMode, setIsJournalMode] = useState(false);
  const [currentJournal, setCurrentJournal] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, account: '', balance: 0, isAsset: false, position: { x: 0, y: 0 } });
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [accountInfo, setAccountInfo] = useState({ visible: false, account: '', balance: 0, isAsset: false });
  const [showDetails, setShowDetails] = useState({ visible: false, type: null });
  const [cameraPosition, setCameraPosition] = useState([0, 12, 20]);
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
  const rainIntensity = 1;
  const [accountBalances, setAccountBalances] = useState({
    // Liability accounts (left side)
    'Credit Card Debt': 0,
    'Bank Loan': 0,
    'Accounts Payable': 0,
    'Mortgage': 0,
    'Tax Payable': 0,
    'Accrued Expenses': 0,
    'Short-term Debt': 0,
    // Asset accounts (right side)
    'Cash Account': 0,
    'HSBC Bank': 0,
    'Inventory': 0,
    'Equipment': 0,
    'Real Estate': 0,
    'Investments': 0,
  });

  const handleJournalClick = () => {
    if (isJournalMode) {
      setIsJournalMode(false);
      setCurrentJournal(null);
      setSelectedAccount(null);
      setClickCounts({});
    } else {
      setIsJournalMode(true);
      setCurrentJournal({
        id: journalEntries.length + 1,
        entries: [],
        selectedAccount: null,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleAddJournalEntry = (entry) => {
    const entryWithTimestamp = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    setCurrentJournal(prev => ({
      ...prev,
      entries: [...prev.entries, entryWithTimestamp]
    }));
  };

  const handleCompleteJournal = () => {
    if (currentJournal && currentJournal.entries.length > 0) {
      setJournalEntries(prev => [currentJournal, ...prev]);
      
      // Update account balances
      setAccountBalances(prev => {
        const newBalances = { ...prev };
        currentJournal.entries.forEach(entry => {
          const currentBalance = newBalances[entry.account] || 0;
          if (entry.type === 'debit') {
            newBalances[entry.account] = currentBalance + entry.amount;
          } else {
            newBalances[entry.account] = currentBalance - entry.amount;
          }
        });
        return newBalances;
      });
      
      setIsJournalMode(false);
      setCurrentJournal(null);
      setSelectedAccount(null);
      setClickCounts({});
    }
  };

  const handleCloseJournal = () => {
    setIsJournalMode(false);
    setCurrentJournal(null);
    setSelectedAccount(null);
    setClickCounts({});
  };

  const handleImportData = (data) => {
    if (data.journalEntries) setJournalEntries(data.journalEntries);
    if (data.accountBalances) setAccountBalances(data.accountBalances);
  };

  const handleTutorialNext = () => {
    setTutorialStep(prev => Math.min(prev + 1, 3));
  };

  const handleTutorialPrev = () => {
    setTutorialStep(prev => Math.max(prev - 1, 0));
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleAccountInfoClick = (accountName, isAsset) => {
    setAccountInfo({
      visible: true,
      account: accountName,
      balance: accountBalances[accountName] || 0,
      isAsset: isAsset
    });
  };

  const handleAccountInfoClose = () => {
    setAccountInfo({ visible: false, account: '', balance: 0, isAsset: false });
  };

  const handleCloseDetails = () => {
    setShowDetails({ visible: false, type: null });
  };

  // Prepare account details data
  const assetDetails = assetAccounts.map(acc => ({
    name: acc.name,
    balance: accountBalances[acc.name] || 0
  }));

  const liabilityDetails = liabilityAccounts.map(acc => ({
    name: acc.name,
    balance: accountBalances[acc.name] || 0
  }));

  const handleCameraChange = (position, target) => {
    setCameraPosition(position);
    setCameraTarget(target);
  };

  useEffect(() => {
    if (currentJournal && selectedAccount) {
      setCurrentJournal(prev => ({
        ...prev,
        selectedAccount: selectedAccount
      }));
    }
  }, [selectedAccount, currentJournal]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: 'linear-gradient(135deg, #87ceeb 0%, #98fb98 50%, #f0e68c 100%)',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes titleGlow {
            0% { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
            100% { box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .ui-panel {
            animation: fadeInUp 0.6s ease-out;
            transition: all 0.3s ease;
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.9) !important;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .ui-panel:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.95) !important;
          }
          
          .button-hover {
            transition: all 0.3s ease;
          }
          
          .button-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }

          /* Balance items hover via CSS instead of inline handlers */
          .balance-item:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
          }

          .asset-item:hover {
            background: #c8e6c9 !important;
          }

          .liability-item:hover {
            background: #ffcdd2 !important;
          }
        `}
      </style>
      <Canvas 
        camera={{ position: cameraPosition, fov: 50 }}
        style={{ background: '#ffffff' }}
      >
        <Scene
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          clickCounts={clickCounts}
          setClickCounts={setClickCounts}
          isJournalMode={isJournalMode}
          accountBalances={accountBalances}
          onAccountInfoClick={handleAccountInfoClick}
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          rainIntensity={rainIntensity}
        />
      </Canvas>
      
      {/* Title/Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#333',
        fontSize: '32px',
        fontWeight: 'bold',
        zIndex: 999,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '16px 40px',
        borderRadius: '20px',
        border: '3px solid #e0e0e0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        animation: 'titleGlow 3s ease-in-out infinite alternate'
      }}>
        🌳 Accounting Garden 🌳
        <div style={{
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#666',
          marginTop: '4px',
          fontStyle: 'italic'
        }}>
          Interactive 3D Financial Management
        </div>
      </div>

      {/* Legend */}
      <div className="ui-panel" style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 999,
        border: '3px solid #e0e0e0',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#333' }}>🗺️ Legend</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            background: '#4a7c3c', 
            borderRadius: '4px', 
            marginRight: '10px',
            border: '1px solid #2d5016'
          }} />
          <span style={{ fontSize: '14px', color: '#555' }}>Assets (Left - Green)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            background: '#cd853f', 
            borderRadius: '4px', 
            marginRight: '10px',
            border: '1px solid #8b4513'
          }} />
          <span style={{ fontSize: '14px', color: '#555' }}>Liabilities (Right - Brown)</span>
        </div>
        <div style={{ fontSize: '12px', marginTop: '10px', color: '#666', fontStyle: 'italic' }}>
          💡 Click "START JOURNAL" to begin
        </div>
      </div>
      
      <JournalButton onJournalClick={handleJournalClick} isJournalMode={isJournalMode} />
      
      {/* Help Button */}
      <button
        className="button-hover"
        onClick={() => setShowTutorial(true)}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          borderRadius: '12px',
          cursor: 'pointer',
          zIndex: 1001,
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        ❓ Help
      </button>
      
      {isJournalMode && (
        <JournalPanel
          currentJournal={currentJournal}
          onAddEntry={handleAddJournalEntry}
          onCloseJournal={handleCloseJournal}
          onCompleteJournal={handleCompleteJournal}
          clickCount={clickCounts[selectedAccount] || 0}
        />
      )}
      
      <JournalDisplay journalEntries={journalEntries} />
      
      <BalanceDashboard 
        accountBalances={accountBalances} 
        journalEntries={journalEntries}
        onAssetClick={() => setShowDetails({ visible: true, type: 'assets' })}
        onLiabilityClick={() => setShowDetails({ visible: true, type: 'liabilities' })}
      />
      <ExportImportPanel 
        journalEntries={journalEntries} 
        accountBalances={accountBalances}
        onImport={handleImportData}
      />
      
      {/* Account Details Modal */}
      <AccountDetailsModal
        isVisible={showDetails.visible}
        type={showDetails.type}
        accounts={showDetails.type === 'assets' ? assetDetails : liabilityDetails}
        onClose={handleCloseDetails}
      />
      
      {/* Tooltip */}
      <Tooltip 
        account={tooltip.account}
        balance={tooltip.balance}
        isAsset={tooltip.isAsset}
        position={tooltip.position}
        visible={tooltip.visible}
      />
      
      {/* Tutorial */}
      <Tutorial
        isVisible={showTutorial}
        onClose={handleTutorialClose}
        currentStep={tutorialStep}
        onNext={handleTutorialNext}
        onPrev={handleTutorialPrev}
      />
      
      {/* Account Info Panel */}
      <AccountInfoPanel
        account={accountInfo.account}
        balance={accountInfo.balance}
        isAsset={accountInfo.isAsset}
        journalEntries={journalEntries}
        visible={accountInfo.visible}
        onClose={handleAccountInfoClose}
      />
      
      {/* Camera Controls */}
      <CameraControls onCameraChange={handleCameraChange} />
    </div>
  );
}