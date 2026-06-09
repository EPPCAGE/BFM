import type { PokemonInPlay, PokemonCardDef } from '../game/types';
import { CardImage } from './CardImage';

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
}

export function PokemonCard({
  pokemon, isSelected, isTargetable, onClick,
  showAttacks, onAttack, canAffordAttack,
  evolutionCard, onEvolve,
}: Props) {
  const { def, currentHp, vulnerability } = pokemon;
  const hpPercent = (currentHp / def.hp) * 100;
  const hpColor = hpPercent > 60 ? '#22c55e' : hpPercent > 30 ? '#f59e0b' : '#ef4444';

  const isVulnerable = vulnerability === 'vulnerable';
  let borderClass = isVulnerable ? 'card-vulnerable' : 'card-ready';
  if (isSelected) borderClass = 'border-2 border-blue-400 shadow-[0_0_16px_4px_#60a5fa]';
  if (isTargetable) borderClass = 'border-2 border-orange-400 card-attack-target-pulse cursor-pointer';

  // When vulnerable, rotate 90° — use a wrapper that reserves the rotated footprint
  const W = 90, H = 120;
  const outerStyle = isVulnerable
    ? { width: H, height: W, minWidth: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { width: W, minWidth: W };

  return (
    <div style={outerStyle} onClick={onClick} title={def.displayName}>
    <div
      className={`relative rounded-lg overflow-hidden select-none ${borderClass} ${onClick ? 'cursor-pointer' : ''} transition-transform duration-300`}
      style={isVulnerable
        ? { width: W, minWidth: W, transform: 'rotate(90deg)', boxShadow: '0 0 16px 5px rgba(239,68,68,0.6), 0 4px 12px rgba(0,0,0,0.7)' }
        : { width: W, minWidth: W }}
    >
      <CardImage card={def} className="w-full" style={{ height: 120 }} />

      {/* HP Bar */}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-1" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)' }}>
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[9px] text-white font-bold truncate max-w-[52px]">{def.displayName}</span>
          <span className="text-[9px] font-bold" style={{ color: hpColor }}>{currentHp}<span className="text-slate-500">/{def.hp}</span></span>
        </div>
        <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${hpPercent}%`,
              background: hpPercent > 60
                ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                : hpPercent > 30
                  ? 'linear-gradient(90deg,#b45309,#f59e0b)'
                  : 'linear-gradient(90deg,#b91c1c,#ef4444)',
              boxShadow: `0 0 6px ${hpColor}80`,
            }}
          />
        </div>
      </div>

      {/* Evolution indicator */}
      {pokemon.evolutionStack.length > 1 && (
        <div className="absolute top-0.5 right-0.5 bg-gradient-to-br from-purple-600 to-purple-800 text-white text-[8px] rounded-full px-1 py-px font-bold shadow-md border border-purple-400/40">
          Evo {pokemon.evolutionStack.length}
        </div>
      )}

      {/* State badge */}
      <div className={`absolute top-0.5 left-0.5 text-[8px] rounded-full px-1.5 py-px font-extrabold tracking-wide shadow-md ${
        vulnerability === 'ready'
          ? 'bg-gradient-to-r from-green-700 to-green-600 text-green-100 border border-green-400/40'
          : 'bg-gradient-to-r from-red-700 to-red-600 text-red-100 border border-red-400/40'
      }`}>
        {vulnerability === 'ready' ? '✓ PRONTO' : '⚔ VULN'}
      </div>

      {/* Evolve button */}
      {evolutionCard && onEvolve && (
        <button
          className="absolute bottom-9 left-0 right-0 mx-1 text-white text-[9px] font-bold rounded-full py-0.5 text-center z-10 transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
            boxShadow: '0 0 12px rgba(147,51,234,0.6)',
            border: '1px solid rgba(196,132,252,0.4)',
          }}
          onClick={(e) => { e.stopPropagation(); onEvolve(); }}
          title={`Evoluir para ${evolutionCard.displayName}`}
        >
          ↑ {evolutionCard.displayName}
        </button>
      )}

      {/* Attacks panel — leaves bottom 28px for the HP bar */}
      {showAttacks && (
        <div className="absolute inset-0 flex flex-col p-1.5 gap-1 rounded-lg" style={{ bottom: 30, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(4px)' }}>
          <p className="text-white text-[9px] font-extrabold text-center tracking-wide border-b border-white/10 pb-0.5 mb-0.5">{def.displayName}</p>
          {def.attacks.map((atk, i) => (
            <button
              key={i}
              disabled={canAffordAttack ? !canAffordAttack(atk.cost) : false}
              onClick={(e) => { e.stopPropagation(); onAttack?.(i); }}
              className="text-[9px] text-left px-1.5 py-1 rounded-lg disabled:opacity-35 disabled:cursor-not-allowed text-white transition-all hover:scale-105"
              style={{
                background: (canAffordAttack && canAffordAttack(atk.cost))
                  ? 'linear-gradient(135deg,rgba(30,64,175,0.8),rgba(37,99,235,0.7))'
                  : 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <span className="font-bold">{atk.name}</span>
              <span className="text-yellow-300"> {atk.cost}⚡</span>
              {atk.damage > 0 ? <span className="text-red-300 font-bold"> {atk.damageText ?? atk.damage}</span> : <span className="text-purple-300"> ✨</span>}
            </button>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
