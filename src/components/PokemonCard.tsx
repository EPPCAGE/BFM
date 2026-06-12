import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PokemonInPlay, PokemonCardDef } from '../game/types';
import { CardImage } from './CardImage';
import { DamageNumber, type DamageEvent } from './DamageNumber';
import { ParticleBurst } from './ParticleBurst';

interface Props {
  pokemon: PokemonInPlay;
  isSelected?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
  showAttacks?: boolean;
  onAttack?: (attackIndex: number) => void;
  canAffordAttack?: (cost: number) => boolean;
  evolutionCard?: PokemonCardDef;
  onEvolve?: () => void;
  showAbility?: boolean;
  onMewAbility?: () => void;
  cardWidth?: number;
  cardHeight?: number;
  damageEvents?: DamageEvent[];
  onDamageEventDone?: (id: string) => void;
  shaking?: boolean;
  evolving?: boolean;
}

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -9, 9, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: 'easeInOut' as const },
  },
};

export function PokemonCard({
  pokemon, isSelected, isTargetable, onClick,
  showAttacks, onAttack, canAffordAttack,
  evolutionCard, onEvolve,
  showAbility, onMewAbility,
  cardWidth = 90, cardHeight = 120,
  damageEvents = [], onDamageEventDone,
  shaking, evolving,
}: Props) {
  const { def, currentHp, vulnerability } = pokemon;
  const hpPercent = Math.max(0, (currentHp / def.hp) * 100);
  const hpColor = hpPercent > 60 ? '#22c55e' : hpPercent > 30 ? '#f59e0b' : '#ef4444';

  const [showKoBurst, setShowKoBurst] = useState(false);
  const prevHpRef = useRef(currentHp);

  useEffect(() => {
    if (prevHpRef.current > 0 && currentHp <= 0) {
      setShowKoBurst(true);
    }
    prevHpRef.current = currentHp;
  }, [currentHp]);

  const isVulnerable = vulnerability === 'vulnerable';
  let borderClass = isVulnerable ? 'card-vulnerable' : 'card-ready';
  if (isSelected) borderClass = 'border-2 border-blue-400 shadow-[0_0_12px_3px_#60a5fa]';
  if (isTargetable) borderClass = 'border-2 border-orange-400 shadow-[0_0_16px_4px_#fb923c] cursor-pointer card-attack-target-pulse';

  const W = cardWidth;
  const H = cardHeight;

  // Outer wrapper reserves the footprint (rotated or normal)
  const outerStyle = isVulnerable
    ? { width: H, height: W, minWidth: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { width: W, minWidth: W };

  // Rotation wrapper — separate from motion.div so Framer Motion doesn't fight the transform
  const rotationStyle = isVulnerable
    ? { width: W, minWidth: W, transform: 'rotate(90deg)', transformOrigin: 'center' }
    : { width: W, minWidth: W };

  return (
    <div style={outerStyle} onClick={onClick} title={def.displayName}>
      {/* Rotation wrapper — plain div so rotation is stable */}
      <div style={rotationStyle}>
        {/* Shake wrapper — Framer Motion only controls translateX */}
        <motion.div
          variants={shakeVariants}
          animate={shaking ? 'shake' : 'idle'}
          style={{ position: 'relative' }}
        >
          {/* Card surface — clip overflows */}
          <div
            className={`relative rounded-lg overflow-hidden select-none ${borderClass} ${onClick ? 'cursor-pointer' : ''}`}
            style={{ width: W, height: H }}
          >
            <CardImage card={def} className="w-full" style={{ height: H }} />

            {/* White flash on hit */}
            <AnimatePresence>
              {shaking && (
                <motion.div
                  key="flash"
                  initial={{ opacity: 0.55 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 bg-white pointer-events-none z-20"
                />
              )}
            </AnimatePresence>

            {/* Evolution glow ring */}
            <AnimatePresence>
              {evolving && (
                <motion.div
                  key="evoglow"
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="absolute inset-0 pointer-events-none z-30 rounded-full"
                  style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.85) 0%, rgba(99,102,241,0.4) 50%, transparent 70%)' }}
                />
              )}
            </AnimatePresence>

            {/* Evolution stack indicator */}
            {pokemon.evolutionStack.length > 1 && (
              <div className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[8px] rounded px-0.5 font-bold z-10">
                Evo {pokemon.evolutionStack.length}
              </div>
            )}

            {/* State badge */}
            <div className={`absolute top-0.5 left-0.5 text-[8px] rounded px-0.5 font-bold z-10 ${
              vulnerability === 'ready' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {vulnerability === 'ready' ? 'PRONTO' : 'VULN'}
            </div>

            {/* Evolve button */}
            {evolutionCard && onEvolve && (
              <button
                className="absolute bottom-8 left-0 right-0 mx-1 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-bold rounded py-0.5 text-center shadow-lg z-10"
                onClick={(e) => { e.stopPropagation(); onEvolve(); }}
                title={`Evoluir para ${evolutionCard.displayName}`}
              >
                ↑ {evolutionCard.displayName}
              </button>
            )}

            {/* HP Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-1 py-0.5 z-10">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[9px] text-white font-bold truncate" style={{ maxWidth: W * 0.6 }}>{def.displayName}</span>
                <span className="text-[9px] text-white">{currentHp}/{def.hp}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ backgroundColor: hpColor }}
                />
              </div>
            </div>

            {/* Attacks panel */}
            {showAttacks && (
              <div className="absolute inset-0 bg-black/85 flex flex-col justify-center p-1.5 gap-1 rounded-lg z-20" style={{ paddingBottom: 28 }}>
                <p className="text-white text-[9px] font-bold text-center mb-0.5">{def.displayName}</p>
                {def.attacks.map((atk, i) => (
                  <button
                    key={i}
                    disabled={canAffordAttack ? !canAffordAttack(atk.cost) : false}
                    onClick={(e) => { e.stopPropagation(); onAttack?.(i); }}
                    className="text-[9px] text-left px-1.5 py-1 rounded bg-slate-700 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  >
                    <span className="font-bold">{atk.name}</span>
                    <span className="text-yellow-300"> {atk.cost}⚡</span>
                    {atk.damage > 0 && <span className="text-red-300"> {atk.damageText ?? atk.damage}</span>}
                  </button>
                ))}
                {showAbility && def.ability?.name === 'Baú de DNA' && !pokemon.hasUsedAbilityThisTurn && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMewAbility?.(); }}
                    className="text-[9px] text-left px-1.5 py-1 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-bold mt-0.5"
                  >
                    🌟 Baú de DNA
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Damage numbers — rendered outside clip so they float above */}
          {damageEvents.length > 0 && onDamageEventDone && (
            <DamageNumber events={damageEvents} onDone={onDamageEventDone} />
          )}

          {/* KO particle burst */}
          {showKoBurst && (
            <ParticleBurst
              pokemonType={def.pokemonType}
              onDone={() => setShowKoBurst(false)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
