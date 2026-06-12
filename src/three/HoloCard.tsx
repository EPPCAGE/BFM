import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { CardDef } from '../game/types';
import { loadCardTexture, onCardTexture, loadBackTexture } from './cardTexture';

export const CARD_W = 1.0;
export const CARD_H = 1.4;
const CARD_D = 0.025;

// ── Holographic foil shader ──
const holoVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const holoFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uStrength;

  vec3 hue(float h) {
    vec3 c = abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0;
    return clamp(c, 0.0, 1.0);
  }

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
    // diffraction stripes shifting with angle + time
    float angle = dot(vViewDir, vec3(1.0, 1.0, 0.0));
    float bands = sin((vUv.x + vUv.y) * 26.0 + angle * 6.0 + uTime * 0.6);
    float h = fract(vUv.y * 0.7 + angle * 0.5 + uTime * 0.04 + bands * 0.05);
    vec3 rainbow = hue(h);
    float sparkle = smoothstep(0.7, 1.0, bands) * 0.5;
    float a = (fres * 0.7 + sparkle) * uStrength;
    gl_FragColor = vec4(rainbow, a);
  }
`;

interface Props {
  card: CardDef;
  faceUp?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  /** holo intensity 0..1 */
  holo?: number;
  glowColor?: string;
  highlighted?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  hoverLift?: boolean;
}

export function HoloCard({
  card, faceUp = true, position = [0, 0, 0], rotation = [0, 0, 0],
  scale = 1, holo = 0.0, glowColor, highlighted, onClick,
  onPointerOver, onPointerOut, hoverLift = true,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const holoMat = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [frontTex, setFrontTex] = useState<THREE.Texture>(() => loadCardTexture(card));
  const backTex = useMemo(() => loadBackTexture(), []);

  useEffect(() => {
    setFrontTex(loadCardTexture(card));
    const off = onCardTexture(card.id, (t) => setFrontTex(t));
    return off;
  }, [card.id]);

  const holoUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uStrength: { value: holo },
  }), []);

  useFrame((state) => {
    if (holoMat.current) {
      holoMat.current.uniforms.uTime.value = state.clock.elapsedTime;
      const target = (hovered ? holo + 0.25 : holo);
      holoMat.current.uniforms.uStrength.value = THREE.MathUtils.lerp(
        holoMat.current.uniforms.uStrength.value, target, 0.1,
      );
    }
    if (!group.current) return;
    // base transform
    const [px, py, pz] = position;
    const lift = hovered && hoverLift ? 0.18 : 0;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, px, 0.2);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, py + lift, 0.2);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, pz + (hovered ? 0.12 : 0), 0.2);

    // tilt toward pointer when hovered
    const [rx, ry, rz] = rotation;
    let tiltX = rx, tiltY = ry;
    if (hovered && hoverLift) {
      const p = state.pointer; // -1..1
      tiltY = ry + p.x * 0.35;
      tiltX = rx - p.y * 0.25;
    }
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, tiltX, 0.15);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tiltY, 0.15);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, rz, 0.15);

    const s = (hovered && hoverLift ? 1.06 : 1) * scale;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.2));
  });

  return (
    <group
      ref={group}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onPointerOver?.(); }}
      onPointerOut={() => { setHovered(false); onPointerOut?.(); }}
    >
      {/* Card body */}
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.06} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#0a0a12" roughness={0.6} metalness={0.2} />
      </RoundedBox>

      {/* Front face */}
      <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
        <planeGeometry args={[CARD_W * 0.97, CARD_H * 0.97]} />
        <meshStandardMaterial
          map={faceUp ? frontTex : backTex}
          roughness={0.85}
          metalness={0}
          envMapIntensity={0.1}
        />
      </mesh>

      {/* Back face */}
      <mesh position={[0, 0, -CARD_D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CARD_W * 0.97, CARD_H * 0.97]} />
        <meshStandardMaterial map={backTex} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Holographic foil overlay (front only) */}
      {faceUp && holo > 0 && (
        <mesh position={[0, 0, CARD_D / 2 + 0.003]}>
          <planeGeometry args={[CARD_W * 0.97, CARD_H * 0.97]} />
          <shaderMaterial
            ref={holoMat}
            vertexShader={holoVertex}
            fragmentShader={holoFragment}
            uniforms={holoUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Highlight glow ring */}
      {highlighted && glowColor && (
        <mesh position={[0, 0, -CARD_D]}>
          <planeGeometry args={[CARD_W * 1.18, CARD_H * 1.14]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
