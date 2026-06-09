import type { CardDef, PokemonCardDef, TrainerCardDef } from '../game/types';
import { CardImage } from './CardImage';

interface Props {
  card: CardDef;
  x: number;
  y: number;
}

const TYPE_COLORS: Record<string, string> = {
  Fire: 'text-orange-400', Water: 'text-blue-400', Grass: 'text-green-400',
  Electric: 'text-yellow-300', Psychic: 'text-pink-400', Fighting: 'text-amber-600',
  Normal: 'text-slate-300', Dragon: 'text-indigo-400', Dark: 'text-slate-500',
  Metal: 'text-slate-400', Fairy: 'text-pink-300',
};

const STAGE_LABEL: Record<string, string> = {
  Basic: 'Básico', Stage1: 'Estágio 1', Stage2: 'Estágio 2',
  ex: 'ex', GX: 'GX', V: 'V', VMAX: 'VMAX', VSTAR: 'VSTAR',
};

export function CardTooltip({ card, x, y }: Props) {
  const tooltipW = 260;
  const maxH = window.innerHeight - 16;
  // Flip left if near right edge
  const left = x + tooltipW + 20 > window.innerWidth ? x - tooltipW - 8 : x + 16;
  // Clamp top so tooltip doesn't go off screen bottom
  const top = Math.min(y - 10, window.innerHeight - maxH + 8);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.max(8, top),
    left,
    zIndex: 9999,
    width: tooltipW,
    maxHeight: maxH,
    overflowY: 'auto',
    pointerEvents: 'none',
  };

  return (
    <div style={style} className="bg-slate-900 border border-slate-600 rounded-xl shadow-2xl text-xs">
      {/* Full card image */}
      <CardImage card={card} className="w-full rounded-t-xl" style={{ height: Math.round(tooltipW * 88 / 63) }} />

      <div className="p-3 flex flex-col gap-2">
        {/* Name + type */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-white text-sm leading-tight">{card.displayName}</span>
          {card.type === 'pokemon' && (
            <span className={`font-bold text-xs ${TYPE_COLORS[(card as PokemonCardDef).pokemonType] ?? 'text-white'}`}>
              {(card as PokemonCardDef).pokemonType}
            </span>
          )}
        </div>

        {card.type === 'pokemon' && (() => {
          const pk = card as PokemonCardDef;
          return (
            <>
              {/* Stage + HP + points */}
              <div className="flex gap-2 text-slate-400 flex-wrap">
                <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">
                  {STAGE_LABEL[pk.stage] ?? pk.stage}
                </span>
                <span className="bg-red-900/60 px-1.5 py-0.5 rounded text-red-300">
                  {pk.hp} HP
                </span>
                <span className="bg-yellow-900/60 px-1.5 py-0.5 rounded text-yellow-300">
                  {pk.pointValue} {pk.pointValue === 1 ? 'ponto' : 'pontos'}
                </span>
                <span className="bg-slate-700 px-1.5 py-0.5 rounded">
                  Evocar: {pk.retreatCost}⚡
                </span>
              </div>

              {/* Evolves from */}
              {pk.evolvesFrom && (
                <div className="text-slate-400">Evolui de: <span className="text-white">{pk.evolvesFrom}</span></div>
              )}

              {/* Ability */}
              {pk.ability && (
                <div className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-2">
                  <div className="font-bold text-purple-300 mb-0.5">
                    Habilidade: {pk.ability.name}
                    <span className="ml-1 text-[10px] text-purple-400">[{pk.ability.category}]</span>
                  </div>
                  <div className="text-slate-300 leading-snug">{pk.ability.text}</div>
                </div>
              )}

              {/* Attacks */}
              <div className="flex flex-col gap-1.5">
                {pk.attacks.map((atk, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-white">{atk.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-300">{atk.cost}⚡</span>
                        {atk.damage > 0 && (
                          <span className="text-red-300 font-bold">{atk.damageText ?? atk.damage}</span>
                        )}
                      </div>
                    </div>
                    {atk.effect && (
                      <div className="text-slate-400 leading-snug">{atk.effect}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {(card.type === 'item' || card.type === 'supporter') && (() => {
          const tr = card as TrainerCardDef;
          return (
            <>
              <div className="flex gap-2">
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  tr.type === 'supporter' ? 'bg-purple-700 text-white' : 'bg-amber-700 text-white'
                }`}>
                  {tr.type === 'supporter' ? 'Apoiador' : 'Item'}
                </span>
                <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-300">
                  Custo: {tr.cost}⚡
                </span>
              </div>
              <div className="text-slate-300 leading-snug">{tr.effect}</div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
