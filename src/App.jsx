import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Sky, Environment, Sparkles, Cloud } from '@react-three/drei';
import * as THREE from 'three';

// LIABILITIES - Right Side (using trees as containers)
const liabilityAccounts = [
  { name: 'Credit Card Debt', position: [8, 0, 2], scale: 1.2 },
  { name: 'Bank Loan', position: [8, 0, -2], scale: 1.5 },
  { name: 'Accounts Payable', position: [4, 0, -2], scale: 1.0 },
  { name: 'Mortgage', position: [4, 0, 2], scale: 1.8 },
  { name: 'Tax Payable', position: [6, 0, 0], scale: 1.3 },
  { name: 'Accrued Expenses', position: [6, 0, -4], scale: 0.9 },
  { name: 'Short-term Debt', position: [4, 0, 0], scale: 1.1 },
];

// ASSETS - Left Side (using trees as containers)
const assetAccounts = [
  { name: 'Cash Account', position: [-4, 0, 4], scale: 1.4 },
  { name: 'Savings Account', position: [-8, 0, 2], scale: 1.6 },
  { name: 'Inventory', position: [-8, 0, -2], scale: 1.2 },
  { name: 'Equipment', position: [-6, 0, 0], scale: 1.5 },
  { name: 'Real Estate', position: [-4, 0, 2], scale: 1.8 },
  { name: 'Investments', position: [-4, 0, -2], scale: 1.3 },
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
  const selectedColor = isSelected ? (clickCount === 1 ? '#4ecdc4' : '#ff6b6b') : (isAsset ? '#6ea057' : '#d2691e');

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
            color={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
            emissive={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
              emissiveIntensity={0.8}
          />
        </mesh>
          {/* Glowing ring around the tree */}
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

      {/* Ripple effect on click */}
      <RippleEffect 
        position={[0, 0.01, 0]} 
        visible={isSelected && clickCount > 0}
        color={clickCount === 1 ? '#4ecdc4' : '#ff6b6b'}
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
           color={clickCount === 1 ? '#ffffff' : '#ffffff'}
           anchorX="center"
           anchorY="middle"
           outlineWidth={0.02}
           outlineColor="#000000"
           fontWeight="bold"
         >
           {clickCount === 1 ? 'DEBIT' : clickCount === 2 ? 'CREDIT' : ''}
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

// Pergola/Gazebo Structure
function Pergola({ position, size = 3 }) {
  return (
    <group position={position}>
      {/* Four corner posts */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((pos, i) => (
        <mesh key={i} position={[pos[0] * size/2, 1.2, pos[2] * size/2]}>
          <cylinderGeometry args={[0.08, 0.1, 2.4, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
        </mesh>
      ))}
      {/* Top beams */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[size + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.4, size/3]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[size + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.4, -size/3]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[size + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {/* Cross beams */}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 2.3, z * size]} rotation={[0, 0, 0]}>
          <boxGeometry args={[size * 0.8, 0.08, 0.08]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
        </mesh>
      ))}
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useFrame(() => {
    if (camera && isTransitioning) {
      // Smooth camera movement
      const targetPosition = new THREE.Vector3(...position);
      const distance = camera.position.distanceTo(targetPosition);
      
      if (distance > 0.1) {
        camera.position.lerp(targetPosition, 0.05);
        camera.lookAt(...target);
      } else {
        setIsTransitioning(false);
      }
    }
  });
  
  // Update camera position when props change
  useEffect(() => {
    if (camera) {
      setIsTransitioning(true);
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
    
    if (currentCount === 2) {
      // Reset this account and clear selection
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
      
      {/* Clouds */}
      <Cloud
        position={[0, 20, 0]}
        speed={0.4}
        opacity={0.6}
        color="#ffffff"
      />
      <Cloud
        position={[-15, 25, -10]}
        speed={0.2}
        opacity={0.4}
        color="#ffffff"
      />
      <Cloud
        position={[15, 18, 5]}
        speed={0.3}
        opacity={0.5}
        color="#ffffff"
      />

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

      {/* Fog for depth perception */}
      <fog attach="fog" args={['#87ceeb', 10, 50]} />

      {/* Central pathway */}
      <GardenPath position={[0, 0.02, 0]} width={2.5} length={18} />

      {/* Decorative paths */}
      <GardenPath position={[-6, 0.02, 0]} width={1.5} length={12} />
      <GardenPath position={[6, 0.02, 0]} width={1.5} length={12} />

      {/* ASSET SIDE (Left) - Green/Natural tones */}
      <group>
        {/* Account trees */}
        {assetAccounts.map((account, index) => (
          <TreeAccount
            key={`asset-${account.name}-${index}`}
            name={account.name}
            position={account.position}
            scale={account.scale}
            onSelect={() => handleTreeClick(account.name, true)}
            isSelected={selectedAccount === account.name}
            clickCount={clickCounts[account.name] || 0}
            isAsset={true}
            balance={accountBalances[account.name] || 0}
          />
        ))}

        {/* Decorative background trees */}
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
        {/* Account trees */}
        {liabilityAccounts.map((account, index) => (
          <TreeAccount
            key={`liability-${account.name}-${index}`}
            name={account.name}
            position={account.position}
            scale={account.scale}
            onSelect={() => handleTreeClick(account.name, false)}
            isSelected={selectedAccount === account.name}
            clickCount={clickCounts[account.name] || 0}
            isAsset={false}
            balance={accountBalances[account.name] || 0}
          />
        ))}

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
         <Pergola position={[12, 0, 0]} size={2.5} />
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
        
        {/* Pergolas */}
        <Pergola position={[-6, 0, 0]} size={4} />
        <Pergola position={[6, 0, 0]} size={4} />
        
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
    if (amount && !isNaN(amount) && currentJournal.selectedAccount) {
      const transactionType = clickCount === 1 ? 'debit' : 'credit';
      
      onAddEntry({
        account: currentJournal.selectedAccount,
        type: transactionType,
        amount: parseFloat(amount)
      });
      setAmount('');
    }
  };

  const calculateNet = () => {
    const totalDebits = currentJournal.entries
      .filter(entry => entry.type === 'debit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = currentJournal.entries
      .filter(entry => entry.type === 'credit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    return totalDebits - totalCredits;
  };

  const net = calculateNet();
  const isBalanced = Math.abs(net) < 0.01;

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

      <div style={{
        padding: '15px',
        marginBottom: '15px',
        background: isBalanced ? '#e8f5e9' : '#ffebee',
        borderRadius: '8px',
        border: `2px solid ${isBalanced ? '#4caf50' : '#f44336'}`
      }}>
        <strong>Net Balance: </strong>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: isBalanced ? '#4caf50' : '#f44336' }}>
          {net > 0 ? `+$${net.toFixed(2)}` : net < 0 ? `-$${Math.abs(net).toFixed(2)}` : `$${net.toFixed(2)}`}
        </span>
        {isBalanced && <span style={{ marginLeft: '10px', color: '#4caf50' }}>✓ Balanced</span>}
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
            background: clickCount === 1 ? '#e8f5e9' : '#ffebee',
            borderRadius: '8px',
            border: `2px solid ${clickCount === 1 ? '#4caf50' : '#f44336'}`
          }}>
            <strong>Transaction Type: </strong>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: clickCount === 1 ? '#4caf50' : '#f44336' }}>
              {clickCount === 1 ? '📈 Debit (+)' : '📉 Credit (-)'}
            </span>
          </div>
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
          disabled={!isBalanced}
          style={{
            flex: 1,
            padding: '12px',
            background: isBalanced ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isBalanced ? 'pointer' : 'not-allowed',
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
      {isJournalMode ? '🚪 EXIT JOURNAL' : '📖 START JOURNAL'}
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
    'Savings Account': 0,
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
      const totalDebits = currentJournal.entries
        .filter(entry => entry.type === 'debit')
        .reduce((sum, entry) => sum + entry.amount, 0);
      const totalCredits = currentJournal.entries
        .filter(entry => entry.type === 'credit')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      if (Math.abs(totalDebits - totalCredits) < 0.01) {
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
      } else {
        alert('Journal is not balanced! Debits must equal Credits.');
      }
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