import { Canvas, useThree } from '@react-three/fiber';
import { Html, ContactShadows } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { HoloCard, CARD_W } from './HoloCard';
import { ImpactBurst, typeColor } from './ImpactBurst';
import type { GameState, PokemonInPlay, PlayerId, PokemonCardDef } from '../game/types';

const GAP = CARD_W + 0.35;
const AI_Z = -2.1;
const PLAYER_Z = 1.4;

function holoFor(_pk: PokemonInPlay): number {
  return 0;
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

      {/* HP bar sits below the card (toward the camera) so it never overlaps the art */}
      <Html position={[0, 0, 0.88]} center distanceFactor={6} pointerEvents="none" style={{ zIndex: 1 }}>
        <div style={{ width: 82, background: 'rgba(5,8,20,0.82)', borderRadius: 6, padding: '3px 5px', boxShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px #000', marginBottom: 2 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 52 }}>{pk.def.displayName}</span>
            <span style={{ color: pk.currentHp / pk.def.hp > 0.5 ? '#86efac' : '#fca5a5' }}>{pk.currentHp}/{pk.def.hp}</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.max(0, (pk.currentHp / pk.def.hp) * 100)}%`,
              background: pk.currentHp / pk.def.hp > 0.6 ? '#22c55e' : pk.currentHp / pk.def.hp > 0.3 ? '#f59e0b' : '#ef4444',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 7, fontWeight: 800, marginTop: 2, color: vulnerable ? '#fca5a5' : '#4ade80', letterSpacing: 1 }}>
            {vulnerable ? '⚠ VULNERÁVEL' : '✓ PRONTO'}
          </div>
        </div>
      </Html>

      {!isOpponent && isPlayerTurn && !targeting && (
        <Html position={[0, 0.4, 0.4]} center distanceFactor={5} className="holo-actions" pointerEvents="auto" zIndexRange={[200, 100]}>
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
  }, [state]);

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


interface Props {
  state: GameState;
  isPlayerTurn: boolean;
  playerEnergy: number;
  targeting: boolean;
  onAttack?: (instanceId: string, attackIndex: number) => void;
  onEvolve?: (instanceId: string, cardId: string) => void;
  onSelectTarget?: (instanceId: string) => void;
}

function Invalidator({ state }: { state: GameState }) {
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [state, invalidate]);
  return null;
}

export function Field3D({ state, isPlayerTurn, playerEnergy, targeting, onAttack, onEvolve, onSelectTarget }: Props) {
  const aiPos = rowPositions(state.players.ai.playArea, AI_Z);
  const playerPos = rowPositions(state.players.player.playArea, PLAYER_Z);
  const allPos = { ...aiPos, ...playerPos };

  return (
    <Canvas shadows={false} dpr={[1, 1.2]} camera={{ position: [0, 3.0, 5.2], fov: 52 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      frameloop="demand">
      <Invalidator state={state} />
      <color attach="background" args={['#081c14']} />

      <ambientLight intensity={0.85} color="#e8eeff" />
      <directionalLight position={[0, 8, 4]} intensity={1.4} color="#ffffff" />
      <pointLight position={[0, 4, 3]} intensity={40} color="#4f8cff" distance={18} />
      <pointLight position={[0, 3, -3]} intensity={35} color="#ff4f6a" distance={16} />

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

      <ContactShadows position={[0, 0, 0]} opacity={0.25} scale={20} blur={1.5} far={6} frames={1} />

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
    </Canvas>
  );
}
