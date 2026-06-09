import type { PokemonInPlay } from '../game/types';
import { CardImage } from './CardImage';

interface Props {
  pokemon: PokemonInPlay;
  isSelected?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
  showAttacks?: boolean;
  onAttack?: (attackIndex: number) => void;
  canAffordAttack?: (cost: number) => boolean;
}

export function PokemonCard({
  pokemon, isSelected, isTargetable, onClick,
  showAttacks, onAttack, canAffordAttack,
}: Props) {
  const { def, currentHp, vulnerability } = pokemon;
  const hpPercent = (currentHp / def.hp) * 100;
  const hpColor = hpPercent > 60 ? '#22c55e' : hpPercent > 30 ? '#f59e0b' : '#ef4444';

  let borderClass = vulnerability === 'ready' ? 'card-ready' : 'card-vulnerable';
  if (isSelected) borderClass = 'border-2 border-blue-400 shadow-[0_0_12px_3px_#60a5fa]';
  if (isTargetable) borderClass = 'border-2 border-orange-400 shadow-[0_0_12px_3px_#fb923c] cursor-pointer animate-pulse';

  return (
    <div
      className={`relative rounded-lg overflow-hidden select-none ${borderClass} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: 90, minWidth: 90 }}
      onClick={onClick}
      title={def.displayName}
    >
      <CardImage card={def} className="w-full" style={{ height: 120 }} />

      {/* HP Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[9px] text-white font-bold truncate max-w-[55px]">{def.displayName}</span>
          <span className="text-[9px] text-white">{currentHp}/{def.hp}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
          />
        </div>
      </div>

      {/* Evolution indicator */}
      {pokemon.evolutionStack.length > 1 && (
        <div className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[8px] rounded px-0.5">
          Evo {pokemon.evolutionStack.length}
        </div>
      )}

      {/* State badge */}
      <div className={`absolute top-0.5 left-0.5 text-[8px] rounded px-0.5 font-bold ${
        vulnerability === 'ready' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {vulnerability === 'ready' ? 'PRONTO' : 'VULN'}
      </div>

      {/* Attacks panel (shown on hover if enabled) */}
      {showAttacks && (
        <div className="absolute inset-0 bg-black/85 flex flex-col justify-center p-1 gap-1 rounded-lg">
          <p className="text-white text-[9px] font-bold text-center mb-1">{def.displayName}</p>
          {def.attacks.map((atk, i) => (
            <button
              key={i}
              disabled={canAffordAttack ? !canAffordAttack(atk.cost) : false}
              onClick={(e) => { e.stopPropagation(); onAttack?.(i); }}
              className="text-[9px] text-left px-1 py-0.5 rounded bg-slate-700 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <span className="font-bold">{atk.name}</span>
              <span className="text-yellow-300"> {atk.cost}⚡</span>
              {atk.damage > 0 && <span className="text-red-300"> {atk.damageText ?? atk.damage}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
