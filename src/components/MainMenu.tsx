import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { STARTER_DECKS } from '../data/decks';
import { POKEMON_CARDS } from '../data/cards';
import { CardImage } from './CardImage';
import type { PokemonCardDef } from '../game/types';

export function MainMenu() {
  const { startGame } = useGameStore();
  const [playerDeck, setPlayerDeck] = useState(STARTER_DECKS[0].id);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const aiDeckId = STARTER_DECKS.find(d => d.id !== playerDeck)?.id ?? STARTER_DECKS[1].id;

  const difficultyLabels = {
    easy: { label: 'Fácil', desc: 'Ataca sempre que possível', color: 'bg-green-700' },
    medium: { label: 'Médio', desc: 'Prioriza alvos de alto valor', color: 'bg-yellow-600' },
    hard: { label: 'Difícil', desc: 'Avalia pontos, vulnerabilidade e economia de energia', color: 'bg-red-700' },
  };

  // Preview: get some pokemon from the selected deck
  const deckDef = STARTER_DECKS.find(d => d.id === playerDeck)!;
  const uniqueIds = [...new Set(deckDef.cards.filter(id => {
    const def = POKEMON_CARDS.find(p => p.id === id);
    return !!def;
  }))].slice(0, 6);
  const previewPokemon = uniqueIds.map(id => POKEMON_CARDS.find(p => p.id === id)!).filter(Boolean) as PokemonCardDef[];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-6xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
          LORKEMON
        </h1>
        <p className="text-slate-400 mt-2">TCG Digital inspirado em Pokémon TCG & Lorcana</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
        {/* Deck Selection */}
        <div className="flex-1 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">Escolha seu Deck</h2>
          <div className="flex flex-col gap-3">
            {STARTER_DECKS.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setPlayerDeck(deck.id)}
                className={`p-4 rounded-xl text-left border-2 transition-all ${
                  playerDeck === deck.id
                    ? 'border-yellow-400 bg-slate-700'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="font-bold text-white">{deck.name}</div>
                <div className="text-xs text-slate-400 mt-1">{deck.description}</div>
              </button>
            ))}
          </div>

          {/* Deck preview */}
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Pokémon do deck:</p>
            <div className="flex flex-wrap gap-1">
              {previewPokemon.map((p) => (
                <div key={p.id} title={p.displayName} style={{ width: 44, height: 62 }} className="rounded overflow-hidden">
                  <CardImage card={p} className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty + Start */}
        <div className="flex-1 bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Dificuldade da IA</h2>
            <div className="flex flex-col gap-2">
              {(Object.entries(difficultyLabels) as [typeof difficulty, typeof difficultyLabels[typeof difficulty]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`p-3 rounded-xl text-left border-2 transition-all ${
                    difficulty === key
                      ? `border-white ${val.color} opacity-100`
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold text-white">{val.label}</span>
                  <p className="text-xs text-slate-300 mt-0.5">{val.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-3">
              IA jogará com: <strong className="text-white">
                {STARTER_DECKS.find(d => d.id === aiDeckId)?.name}
              </strong>
            </p>
            <button
              onClick={() => startGame(playerDeck, aiDeckId, difficulty)}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
            >
              JOGAR
            </button>
          </div>
        </div>
      </div>

      {/* Rules summary */}
      <div className="max-w-4xl w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-bold text-slate-300 mb-2">Regras Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
          <div>🏆 <strong className="text-white">10 pontos</strong> para vencer</div>
          <div>⚡ Qualquer carta vira energia (1x/turno)</div>
          <div>🛡️ Pokémon começa <span className="text-green-400">PRONTO</span> no seu turno</div>
          <div>⚔️ Atacar torna o Pokémon <span className="text-red-400">VULNERÁVEL</span></div>
          <div>🔄 Contra-ataque automático se sobreviver</div>
          <div>📦 Deck out = derrota</div>
          <div>🃏 60 cartas, max 4 cópias</div>
          <div>🦊 Máx 5 Pokémon em jogo</div>
        </div>
      </div>
    </div>
  );
}
