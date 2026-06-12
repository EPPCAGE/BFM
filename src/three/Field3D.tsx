import { Canvas } from '@react-three/fiber';
import { Html, ContactShadows, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense } from 'react';
import * as THREE from 'three';
import { HoloCard, CARD_W } from './HoloCard';
import type { GameState, PokemonInPlay, PlayerId, PokemonCardDef } from '../game/types';

const GAP = CARD_W + 0.35;

function holoFor(pk: PokemonInPlay): number {
  // rarer / higher-value Pokémon shine more
  const v = pk.def.pointValue ?? 1;
  if (v >= 3) return 0.9;
  if (v === 2) return 0.6;
  return 0.32;
}

interface RowProps {
  pokemons: PokemonInPlay[];
  z: number;
  owner: PlayerId;
  state: GameState;
  onAttack?: (instanceId: string, attackIndex: number) => void;
  onEvolve?: (instanceId: string, cardId: string) => void;
  onSelectTarget?: (instanceId: string) => void;
  targeting: boolean;
  isPlayerTurn: boolean;
  energy: number;
}

function Row({ pokemons, z, owner, state, onAttack, onEvolve, onSelectTarget, targeting, isPlayerTurn, energy }: RowProps) {
  const n = pokemons.length;
  const startX = -((n - 1) * GAP) / 2;
  const isOpponent = owner === 'ai';

  return (
    <>
      {pokemons.map((pk, i) => {
        const x = startX + i * GAP;
        const vulnerable = pk.vulnerability === 'vulnerable';
        const isTarget = targeting && isOpponent && vulnerable;
        const glow = isTarget ? '#fb923c' : vulnerable ? '#ef4444' : '#22c55e';

        // evolution available from hand?
        const evoCard = !isOpponent && isPlayerTurn
          ? (state.players[owner].hand.find(
              c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName,
            ) as PokemonCardDef | undefined)
          : undefined;

        return (
          <group key={pk.instanceId} position={[x, vulnerable ? 0.0 : 0.02, z]}>
            <HoloCard
              card={pk.def}
              position={[0, 0, 0]}
              rotation={[-Math.PI / 2.15, 0, vulnerable ? Math.PI / 2 : 0]}
              holo={holoFor(pk)}
              glowColor={glow}
              highlighted={isTarget || vulnerable}
              hoverLift={!isOpponent}
              onClick={(e) => {
                e.stopPropagation();
                if (isTarget) { onSelectTarget?.(pk.instanceId); }
              }}
            />

            {/* HP bar billboarded above the card */}
            <Html position={[0, 0.02, -0.78]} center distanceFactor={6} pointerEvents="none">
              <div style={{ width: 84, transform: 'translateY(-8px)' }}>
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

            {/* Own-card action panel on hover (attacks + evolve) */}
            {!isOpponent && isPlayerTurn && !targeting && (
              <Html position={[0, 0.4, 0.4]} center distanceFactor={5} className="holo-actions" pointerEvents="auto">
                <div className="holo-action-panel">
                  {pk.def.attacks.map((atk, ai) => (
                    <button
                      key={ai}
                      disabled={energy < atk.cost}
                      onClick={(e) => { e.stopPropagation(); onAttack?.(pk.instanceId, ai); }}
                    >
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
      })}
    </>
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

export function Field3D({ state, isPlayerTurn, playerEnergy, targeting, onAttack, onEvolve, onSelectTarget }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 4.2, 6.2], fov: 42 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 9, 18]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 8, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-4, 3, 2]} intensity={30} color="#3b82f6" distance={14} />
      <pointLight position={[4, 3, -2]} intensity={30} color="#ef4444" distance={14} />

      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b1226" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* Center divider line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[14, 0.06]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>

      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2.4} far={6} />

      {/* AI row (far) */}
      <Row
        pokemons={state.players.ai.playArea}
        z={-2.1}
        owner="ai"
        state={state}
        targeting={targeting}
        isPlayerTurn={isPlayerTurn}
        energy={playerEnergy}
        onSelectTarget={onSelectTarget}
      />
      {/* Player row (near) */}
      <Row
        pokemons={state.players.player.playArea}
        z={1.4}
        owner="player"
        state={state}
        targeting={targeting}
        isPlayerTurn={isPlayerTurn}
        energy={playerEnergy}
        onAttack={onAttack}
        onEvolve={onEvolve}
      />

      <EffectComposer>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
