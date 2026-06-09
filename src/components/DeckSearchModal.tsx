import type { PendingDeckSearch } from '../game/types';
import { CardImage } from './CardImage';
import type { PokemonCardDef } from '../game/types';

interface Props {
  search: PendingDeckSearch;
  onSelect: (cardId: string) => void;
}

const LABELS: Record<string, string> = {
  'ultra-ball': 'Ultra Ball — Escolha um Pokémon do deck',
  'nest-ball': 'Nest Ball — Escolha um Pokémon Básico para colocar em jogo',
  'great-ball': 'Great Ball — Escolha um Pokémon entre os 7 primeiros do deck',
  'level-ball': 'Level Ball — Escolha um Pokémon com HP ≤ 90',
};

export function DeckSearchModal({ search, onSelect }: Props) {
  const label = LABELS[search.trainerCardId] ?? 'Escolha um Pokémon do deck';

  // Deduplicate by id so same species appears once (pick any instance)
  const unique = search.candidates.filter(
    (c, i, arr) => arr.findIndex(x => x.id === c.id) === i
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4">
        <h2 className="text-white font-bold text-base mb-1">{label}</h2>
        <p className="text-slate-400 text-xs mb-4">Clique na carta que deseja pegar</p>
        <div className="flex flex-wrap gap-3 justify-center overflow-y-auto" style={{ maxHeight: 360 }}>
          {unique.map((card) => {
            const def = card as PokemonCardDef;
            return (
              <button
                key={card.id}
                onClick={() => onSelect(card.id)}
                className="flex flex-col items-center gap-1 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg"
              >
                <div className="rounded-lg overflow-hidden" style={{ width: 90, height: 126 }}>
                  <CardImage card={card} className="w-full h-full" />
                </div>
                <span className="text-white text-[10px] font-semibold text-center max-w-[90px] leading-tight">
                  {def.displayName}
                </span>
                <span className="text-slate-400 text-[9px]">HP {def.hp}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
