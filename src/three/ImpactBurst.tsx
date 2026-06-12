import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TYPE_COLOR: Record<string, string> = {
  Fire: '#f97316', Water: '#3b82f6', Grass: '#22c55e', Electric: '#eab308',
  Psychic: '#a855f7', Fighting: '#b45309', Normal: '#cbd5e1', Dragon: '#6366f1',
  Dark: '#6b7280', Metal: '#9ca3af', Fairy: '#ec4899',
};

interface Props {
  position: [number, number, number];
  color?: string;
  onDone: () => void;
}

const COUNT = 40;

export function ImpactBurst({ position, color = '#ffffff', onDone }: Props) {
  const points = useRef<THREE.Points>(null);
  const life = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5),
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5),
      ).normalize().multiplyScalar(1.5 + Math.random() * 2.5);
      vel.push(dir);
    }
    return { positions: pos, velocities: vel };
  }, []);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.12,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [color]);

  useFrame((_, dt) => {
    if (!points.current) return;
    life.current += dt;
    const geo = points.current.geometry;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      velocities[i].y -= dt * 4; // gravity
      arr[i * 3] += velocities[i].x * dt;
      arr[i * 3 + 1] += velocities[i].y * dt;
      arr[i * 3 + 2] += velocities[i].z * dt;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - life.current / 0.7);
    mat.size = 0.12 * (1 - life.current / 1.2);
    if (life.current > 0.75) onDone();
  });

  return (
    <points ref={points} position={position} material={mat}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}

export function typeColor(t?: string): string {
  return (t && TYPE_COLOR[t]) || '#ffffff';
}
