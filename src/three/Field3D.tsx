import { Canvas, useFrame } from '@react-three/fiber';
import { Html, ContactShadows, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { HoloCard, CARD_W } from './HoloCard';
import { ImpactBurst, typeColor } from './ImpactBurst';
import type { GameState, PokemonInPlay, PlayerId, PokemonCardDef } from '../game/types';

const GAP = CARD_W + 0.35;
const AI_Z = -2.1;
const PLAYER_Z = 1.4;

function holoFor(pk: PokemonInPlay): number {
  const v = pk.def.pointValue ?? 1;
  if (v >= 3) return 0.5;
  if (v === 2) return 0.32;
  return 0.16;
}

function rowPositions(pokemons: PokemonInPlay[], z: number): Record<string, [number, number, number]> {
  const n = pokemons.length;
  const startX = -((n - 1) * GAP) / 2;
  const map: Record<string, [number, number, number]> = {};
  pokemons.forEach((pk, i) => { map[pk.instanceId] = [startX + i * GAP, 0.02, z]; });
  return map;
}

interface CardProps {
  pk: PokemonInPlay;
  pos: [number, number, number];
  owner: PlayerId;
  state: GameState;
  onAttack?: (instanceId: string, attackIndex: number) => void;
  onEvolve?: (instanceId: string, cardId: string) => void;
  onSelectTarget?: (instanceId: string) => void;
  targeting: boolean;
  isPlayerTurn: boolean;
  energy: number;
}

function FieldCard({ pk, pos, owner, state, onAttack, onEvolve, onSelectTarget, targeting, isPlayerTurn, energy }: CardProps) {
  const isOpponent = owner === 'ai';
  const vulnerable = pk.vulnerability === 'vulnerable';
  const isTarget = targeting && isOpponent && vulnerable;
  const glow = isTarget ? '#fb923c' : vulnerable ? '#ef4444' : '#22c55e';

  const evoCard = !isOpponent && isPlayerTurn
    ? (state.players[owner].hand.find(
        c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName,
      ) as PokemonCardDef | undefined)
    : undefined;

  return (
    <group position={pos}>
      <HoloCard
        card={pk.def}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2.15, 0, vulnerable ? Math.PI / 2 : 0]}
        holo={holoFor(pk)}
        glowColor={glow}
        highlighted={isTarget || vulnerable}
        hoverLift={!isOpponent}
        onClick={(e) => { e.stopPropagation(); if (isTarget) onSelectTarget?.(pk.instanceId); }}
      />

      <Html position={[0, 0.02, -0.78]} center distanceFactor={6} pointerEvents="none">
        <div style={{ width: 84 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px #000', marginBottom: 2 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 54 }}>{pk.def.displayName}</span>
            <span>{pk.currentHp}/{pk.def.hp}</span>
          </div>
          <div style={{ height: 5, background: '#334155', borderRadius: 99, overflow: 'hidden', boxShadow: '0 1px 2px #000' }}>
            <div style={{
              height: '100%',
              width: `${Math.max(0, (pk.currentHp / pk.def.hp) * 100)}%`,
              background: pk.currentHp / pk.def.hp > 0.6 ? '#22c55e' : pk.currentHp / pk.def.hp > 0.3 ? '#f59e0b' : '#ef4444',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 8, fontWeight: 800, marginTop: 2, color: vulnerable ? '#fca5a5' : '#86efac' }}>
            {vulnerable ? 'VULNERÁVEL' : 'PRONTO'}
          </div>
        </div>
      </Html>

      {!isOpponent && isPlayerTurn && !targeting && (
        <Html position={[0, 0.4, 0.4]} center distanceFactor={5} className="holo-actions" pointerEvents="auto">
          <div className="holo-action-panel">
            {pk.def.attacks.map((atk, ai) => (
              <button key={ai} disabled={energy < atk.cost} onClick={(e) => { e.stopPropagation(); onAttack?.(pk.instanceId, ai); }}>
                <b>{atk.name}</b> <span style={{ color: '#fde047' }}>{atk.cost}⚡</span>
                {atk.damage > 0 && <span style={{ color: '#fca5a5' }}> {atk.damageText ?? atk.damage}</span>}
              </button>
            ))}
            {evoCard && (
              <button className="evo" onClick={(e) => { e.stopPropagation(); onEvolve?.(pk.instanceId, evoCard.id); }}>
                ↑ {evoCard.displayName}
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Impact detection layer: watches HP drops, spawns 3D bursts ──
interface Burst { id: number; position: [number, number, number]; color: string; }

function ImpactLayer({ state, positions }: { state: GameState; positions: Record<string, [number, number, number]> }) {
  const prevHp = useRef<Record<string, number>>({});
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nonce = useRef(0);

  useEffect(() => {
    const all = [...state.players.player.playArea, ...state.players.ai.playArea];
    const next: Burst[] = [];
    for (const pk of all) {
      const prev = prevHp.current[pk.instanceId];
      if (prev !== undefined && pk.currentHp < prev) {
        const pos = positions[pk.instanceId];
        if (pos) next.push({ id: nonce.current++, position: [pos[0], 0.6, pos[2]], color: typeColor(pk.def.pokemonType) });
      }
      prevHp.current[pk.instanceId] = pk.currentHp;
    }
    // clean up removed
    for (const id of Object.keys(prevHp.current)) {
      if (!all.find(p => p.instanceId === id)) delete prevHp.current[id];
    }
    if (next.length) setBursts(b => [...b, ...next]);
  });

  return (
    <>
      {bursts.map(b => (
        <ImpactBurst key={b.id} position={b.position} color={b.color}
          onDone={() => setBursts(list => list.filter(x => x.id !== b.id))} />
      ))}
    </>
  );
}

// A thin white rectangular outline laid flat on the table (a play zone)
function ZoneOutline({ z, w, d, color = '#eef2ff', opacity = 0.4 }: { z: number; w: number; d: number; color?: string; opacity?: number }) {
  const t = 0.04; // line thickness
  const y = -0.038;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z - d / 2]}>
        <planeGeometry args={[w, t]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z + d / 2]}>
        <planeGeometry args={[w, t]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-w / 2, y, z]}>
        <planeGeometry args={[t, d]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[w / 2, y, z]}>
        <planeGeometry args={[t, d]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// Slow camera breathing for cinematic feel
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.15) * 0.3;
    state.camera.position.y = 3.0 + Math.sin(t * 0.22) * 0.08;
    state.camera.lookAt(0, 0, -0.3);
  });
  return null;
}

interface Props {
  state: GameState;
  isPlayerTurn: boolean;
  playerEnergy: number;
  targeting: boolean;
  onAttack?: (instanceId: string, attackIndex: number) => void;
  onEvolve?: (instanceId: string, cardId: string) => void;
  onSelectTarget?: (instanceId: string) => void;
}

export function Field3D({ state, isPlayerTurn, playerEnergy, targeting, onAttack, onEvolve, onSelectTarget }: Props) {
  const aiPos = rowPositions(state.players.ai.playArea, AI_Z);
  const playerPos = rowPositions(state.players.player.playArea, PLAYER_Z);
  const allPos = { ...aiPos, ...playerPos };

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.0, 5.2], fov: 52 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
      <color attach="background" args={['#081c14']} />
      <fog attach="fog" args={['#081c14', 14, 26]} />

      <CameraRig />

      <ambientLight intensity={0.55} color="#e8eeff" />
      <directionalLight position={[0, 10, 4]} intensity={1.1} castShadow color="#ffffff"
        shadow-mapSize={[2048, 2048]} shadow-camera-near={1} shadow-camera-far={25}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <directionalLight position={[0, 4, -6]} intensity={1.0} color="#ccd8ff" />
      <pointLight position={[-5, 4, 3]} intensity={35} color="#4f8cff" distance={18} />
      <pointLight position={[5, 4, 3]} intensity={35} color="#4f8cff" distance={18} />
      <pointLight position={[-4, 3, -3]} intensity={30} color="#ff4f6a" distance={16} />
      <pointLight position={[4, 3, -3]} intensity={30} color="#ff4f6a" distance={16} />

      <Suspense fallback={null}><Environment preset="lobby" environmentIntensity={0.35} /></Suspense>

      {/* Felt table surface — dark green, matte (no metalness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0c3a26" roughness={0.97} metalness={0} envMapIntensity={0.3} />
      </mesh>
      {/* Subtle side tints (player = blue, AI = red) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 1.4]}>
        <planeGeometry args={[9.2, 1.9]} /><meshBasicMaterial color="#1e3a8a" transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, -2.1]}>
        <planeGeometry args={[9.2, 1.9]} /><meshBasicMaterial color="#7f1d1d" transparent opacity={0.12} />
      </mesh>
      {/* Clean play-zone outlines, one per player */}
      <ZoneOutline z={1.4} w={9.2} d={1.9} color="#bfdbfe" opacity={0.45} />
      <ZoneOutline z={-2.1} w={9.2} d={1.9} color="#fecaca" opacity={0.45} />
      {/* Single center divider line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.038, -0.35]}>
        <planeGeometry args={[10, 0.05]} />
        <meshBasicMaterial color="#eef2ff" transparent opacity={0.5} />
      </mesh>

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={20} blur={1.8} far={6} />

      {state.players.ai.playArea.map(pk => (
        <FieldCard key={pk.instanceId} pk={pk} pos={aiPos[pk.instanceId]} owner="ai" state={state}
          targeting={targeting} isPlayerTurn={isPlayerTurn} energy={playerEnergy} onSelectTarget={onSelectTarget} />
      ))}
      {state.players.player.playArea.map(pk => (
        <FieldCard key={pk.instanceId} pk={pk} pos={playerPos[pk.instanceId]} owner="player" state={state}
          targeting={targeting} isPlayerTurn={isPlayerTurn} energy={playerEnergy}
          onAttack={onAttack} onEvolve={onEvolve} />
      ))}

      <ImpactLayer state={state} positions={allPos} />

      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.7} luminanceSmoothing={0.3} />
        <Vignette eskil={false} offset={0.35} darkness={0.45} />
      </EffectComposer>
    </Canvas>
  );
}
