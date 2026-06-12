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
  if (v >= 3) return 0.9;
  if (v === 2) return 0.6;
  return 0.32;
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

// Slow camera breathing for cinematic feel
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.15) * 0.35;
    state.camera.position.y = 4.2 + Math.sin(t * 0.22) * 0.1;
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
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 4.2, 6.2], fov: 42 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 9, 18]} />

      <CameraRig />

      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 8, 4]} intensity={1.8} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={1} shadow-camera-far={25}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <pointLight position={[-4, 3, 2]} intensity={30} color="#3b82f6" distance={14} />
      <pointLight position={[4, 3, -2]} intensity={30} color="#ef4444" distance={14} />

      <Suspense fallback={null}><Environment preset="night" /></Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b1226" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[14, 0.06]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>

      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2.4} far={6} />

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
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
