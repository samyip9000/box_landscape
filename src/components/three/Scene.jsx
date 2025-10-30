import React from 'react';
import { Stars, Sky, Cloud, OrbitControls } from '@react-three/drei';
import { TreeAccount } from './TreeAccount';
import { RainSystem } from './RainSystem';
import { Fountain } from './decorative/Fountain';
import { Bench } from './decorative/Bench';
import { LampPost } from './decorative/LampPost';
import { DecorativeTree } from './decorative/DecorativeTree';
import { Bush } from './decorative/Bush';
import { Pergola } from './decorative/Pergola';
import { GardenPath } from './decorative/GardenPath';
import { Railing } from './decorative/Railing';
import { FlowerBed } from './decorative/FlowerBed';
import { RockCluster } from './decorative/RockCluster';
import { SteppingStones } from './decorative/SteppingStones';
import { Topiary } from './decorative/Topiary';
import { assetAccounts, liabilityAccounts } from '../../data/accounts';

export function Scene({ 
  selectedAccount, 
  setSelectedAccount, 
  clickCounts, 
  setClickCounts, 
  isJournalMode, 
  accountBalances, 
  onAccountInfoClick,
  cameraPosition,
  cameraTarget,
  rainIntensity 
}) {
  const handleTreeClick = (accountName, isAsset) => {
    if (!isJournalMode) {
      onAccountInfoClick(accountName, isAsset);
      return;
    }
    
    const currentCount = clickCounts[accountName] || 0;
    
    if (currentCount === 2) {
      setClickCounts(prev => ({ ...prev, [accountName]: 0 }));
      setSelectedAccount(null);
    } else if (selectedAccount === accountName) {
      setClickCounts(prev => ({ ...prev, [accountName]: currentCount + 1 }));
    } else {
      setClickCounts(prev => {
        const newCounts = {};
        [...assetAccounts, ...liabilityAccounts].forEach(acc => {
          if (acc.name !== accountName) {
            newCounts[acc.name] = 0;
          }
        });
        newCounts[accountName] = 1;
        return newCounts;
      });
      setSelectedAccount(accountName);
    }
  };

  return (
    <>
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
      
      {rainIntensity > 0 && (
        <RainSystem intensity={rainIntensity} speed={rainIntensity} />
      )}
      
      <Stars 
        radius={300} 
        depth={60} 
        count={20000} 
        factor={7} 
        saturation={0} 
        fade 
        speed={1}
      />
      
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
      
      {/* Ground */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[40, 40, '#4a7c3c', '#4a7c3c']} position={[0, 0.01, 0]} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#87ceeb', 10, 50]} />

      {/* Central pathway */}
      <GardenPath position={[0, 0.02, 0]} width={2.5} length={18} />

      {/* Side paths */}
      <GardenPath position={[-6, 0.02, 0]} width={1.5} length={12} />
      <GardenPath position={[6, 0.02, 0]} width={1.5} length={12} />

      {/* ASSET SIDE (Left) */}
      <group>
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

        {/* Decorative elements */}
        <DecorativeTree position={[-10, 0, 4]} scale={1.3} treeType="pine" />
        <DecorativeTree position={[-10, 0, -4]} scale={1.1} treeType="round" />
        <DecorativeTree position={[-2, 0, -5]} scale={0.9} treeType="pine" />
        <DecorativeTree position={[-2, 0, 5]} scale={1.0} treeType="round" />
        <DecorativeTree position={[-9, 0, 0]} scale={0.8} treeType="pine" />
        
        <Bush position={[-3, 0, 3]} scale={0.9} />
        <Bush position={[-7, 0, -3]} scale={0.7} />
        <Bush position={[-5, 0, 5]} scale={0.6} />
        <Bush position={[-9, 0, 1]} scale={0.8} />

        <FlowerBed position={[-5, 0, -4]} width={2} depth={0.5} />
        <FlowerBed position={[-8, 0, 4]} width={1.8} depth={0.5} />
        <FlowerBed position={[-3, 0, 0]} width={1.5} depth={0.4} />

        <Railing position={[-11, 0, 0]} width={10} orientation="vertical" />
        <Railing position={[-6, 0, 6]} width={10} orientation="horizontal" />
        <Railing position={[-6, 0, -6]} width={10} orientation="horizontal" />
         
        <Fountain position={[-12, 0, 0]} />
        <Bench position={[-9, 0, -3]} rotation={-Math.PI/4} />
        <LampPost position={[-7, 0, 5]} />
        <Topiary position={[-5, 0, -1]} shape="sphere" />
        <RockCluster position={[-3, 0, 2]} count={3} />
        <SteppingStones startPos={[-2, 0]} endPos={[-8, 0]} count={5} />
      </group>

      {/* LIABILITY SIDE (Right) */}
      <group>
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

        {/* Decorative elements */}
        <DecorativeTree position={[10, 0, 4]} scale={1.2} treeType="round" />
        <DecorativeTree position={[10, 0, -4]} scale={1.0} treeType="pine" />
        <DecorativeTree position={[2, 0, -5]} scale={0.8} treeType="pine" />
        <DecorativeTree position={[2, 0, 4]} scale={0.9} treeType="round" />
        
        <Bush position={[9, 0, 0]} scale={0.8} />
        <Bush position={[3, 0, -3]} scale={0.6} />
        <Bush position={[5, 0, 5]} scale={0.7} />

        <FlowerBed position={[8, 0, 0]} width={1.5} depth={0.4} />
        <FlowerBed position={[4, 0, -4]} width={1.2} depth={0.4} />

        <Railing position={[11, 0, 0]} width={10} orientation="vertical" />
        <Railing position={[6, 0, 6]} width={10} orientation="horizontal" />
        <Railing position={[6, 0, -6]} width={10} orientation="horizontal" />
        
        <Pergola position={[12, 0, 0]} size={2.5} />
        <Bench position={[9, 0, 3]} rotation={Math.PI/4} />
        <LampPost position={[7, 0, -5]} />
        <Topiary position={[5, 0, 1]} shape="cone" />
        <RockCluster position={[3, 0, -2]} count={4} />
        <SteppingStones startPos={[8, 0]} endPos={[2, 0]} count={6} />
      </group>

      {/* CENTRAL AREA */}
      <group>
        <Fountain position={[0, 0, 0]} />
        
        <Pergola position={[-6, 0, 0]} size={4} />
        <Pergola position={[6, 0, 0]} size={4} />
        
        <Bench position={[-3, 0, 6]} rotation={Math.PI} />
        <Bench position={[3, 0, 6]} rotation={Math.PI} />
        <Bench position={[-3, 0, -6]} rotation={0} />
        <Bench position={[3, 0, -6]} rotation={0} />
        
        <LampPost position={[-10, 0, 6]} />
        <LampPost position={[10, 0, 6]} />
        <LampPost position={[-10, 0, -6]} />
        <LampPost position={[10, 0, -6]} />
        <LampPost position={[0, 0, 8]} />
        <LampPost position={[0, 0, -8]} />
        
        <Topiary position={[-1.5, 0, 1.5]} shape="sphere" />
        <Topiary position={[1.5, 0, 1.5]} shape="cone" />
        <Topiary position={[-1.5, 0, -1.5]} shape="cone" />
        <Topiary position={[1.5, 0, -1.5]} shape="sphere" />
        
        <SteppingStones startPos={[-10, -8]} endPos={[-4, -4]} count={6} />
        <SteppingStones startPos={[10, -8]} endPos={[4, -4]} count={6} />
        <SteppingStones startPos={[-10, 8]} endPos={[-4, 4]} count={6} />
        <SteppingStones startPos={[10, 8]} endPos={[4, 4]} count={6} />
        
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