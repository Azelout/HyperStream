import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarField = ({ count = 5000 }) => {
  const mesh = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for(let i = 0; i < count; i++) {
        pos[i*3] = (Math.random() - 0.5) * 100; // x
        pos[i*3+1] = (Math.random() - 0.5) * 100; // y
        pos[i*3+2] = (Math.random() - 0.5) * 100; // z
    }
    return pos;
  }, [count]);

  useFrame(() => {
    // Warp speed effect: move stars towards camera (positive Z) or move camera negative Z
    // We'll move stars towards positive Z
    const positionsAttribute = mesh.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    
    for(let i = 0; i < count; i++) {
        let z = positionsAttribute.getZ(i);
        z += 0.1; // Speed
        if(z > 50) z = -50; // Reset
        positionsAttribute.setZ(i, z);
    }
    positionsAttribute.needsUpdate = true;
    
    mesh.current.rotation.z += 0.0002; // Slight rotation
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#03b3c3" // Neon Cyan
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export const Hyperspeed = () => {
  return (
    <div className="fixed inset-0 z-0 bg-black pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
         <color attach="background" args={['#050505']} />
         <fog attach="fog" args={['#050505', 5, 30]} />
        <StarField />
      </Canvas>
    </div>
  );
};
