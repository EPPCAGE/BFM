import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { STARTER_DECKS } from '../data/decks';
import { POKEMON_CARDS } from '../data/cards';
import { CardImage } from './CardImage';
import type { PokemonCardDef } from '../game/types';

export function MainMenu() {
  const { startGame } = useGameStore();
  const [playerDeck, setPlayerDeck] = useState(STARTER_DECKS[0].id);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extra-hard'>('medium');

  const aiDeckId = STARTER_DECKS.find(d => d.id !== playerDeck)?.id ?? STARTER_DECKS[1].id;

  const difficultyLabels = {
    easy: { label: 'Fácil', desc: 'Ataca sempre que possível', color: 'bg-green-700', border: 'border-green-500' },
    medium: { label: 'Médio', desc: 'Prioriza alvos de alto valor', color: 'bg-yellow-600', border: 'border-yellow-400' },
    hard: { label: 'Difícil', desc: 'Avalia pontos, vulnerabilidade e economia de energia', color: 'bg-red-700', border: 'border-red-500' },
    'extra-hard': { label: 'Extra Difícil', desc: 'Estratégia ativa: combos, Boss\'s Orders, cura e recuo inteligente', color: 'bg-purple-700', border: 'border-purple-500' },
  };

  const deckDef = STARTER_DECKS.find(d => d.id === playerDeck)!;
  const uniqueIds = [...new Set(deckDef.cards.filter(id => !!POKEMON_CARDS.find(p => p.id === id)))].slice(0, 6);
  const previewPokemon = uniqueIds.map(id => POKEMON_CARDS.find(p => p.id === id)!).filter(Boolean) as PokemonCardDef[];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1f3a 0%, #0a0d1a 60%, #04060f 100%)' }}>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 4),
              height: 2 + (i % 4),
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 13 + 10) % 100}%`,
              background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#fbbf24' : '#22d3ee',
              opacity: 0.3 + (i % 5) * 0.1,
              animation: `floatDot ${4 + (i % 6)}s ease-in-out ${i * 0.3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="text-center relative z-10"
      >
        <h1 className="text-7xl font-black tracking-wider logo-glow" style={{ color: '#fde047' }}>
          LORKEMON
        </h1>
        <p className="text-slate-400 mt-2 text-sm tracking-wide">TCG Digital inspirado em Pokémon TCG &amp; Lorcana</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl relative z-10">
        {/* Deck Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 rounded-2xl p-6"
          style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Escolha seu Deck</h2>
          <div className="flex flex-col gap-3">
            {STARTER_DECKS.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setPlayerDeck(deck.id)}
                className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                  playerDeck === deck.id
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/30'
                }`}
                style={playerDeck === deck.id ? { boxShadow: '0 0 16px rgba(250,204,21,0.3)' } : {}}
              >
                <div className="font-bold text-white">{deck.name}</div>
                <div className="text-xs text-slate-400 mt-1">{deck.description}</div>
              </button>
            ))}
          </div>

          {/* Deck preview with stagger animation */}
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Pokémon do deck:</p>
            <div className="flex flex-wrap gap-1.5">
              {previewPokemon.map((p, i) => (
                <motion.div
                  key={`${playerDeck}-${p.id}`}
                  initial={{ opacity: 0, y: 10, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  title={p.displayName}
                  style={{ width: 50, height: 70 }}
                  className="rounded-lg overflow-hidden shadow-lg hover:scale-110 transition-transform duration-150"
                >
                  <CardImage card={p} className="w-full h-full" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Difficulty + Start */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex-1 rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Dificuldade da IA</h2>
            <div className="flex flex-col gap-2">
              {(Object.entries(difficultyLabels) as [typeof difficulty, (typeof difficultyLabels)[typeof difficulty]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`p-3 rounded-xl text-left border-2 transition-all duration-200 ${
                    difficulty === key
                      ? `${val.border} ${val.color}`
                      : 'border-slate-700 bg-slate-700/50 hover:border-slate-500'
                  }`}
                  style={difficulty === key ? { boxShadow: '0 0 12px rgba(255,255,255,0.15)' } : {}}
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
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startGame(playerDeck, aiDeckId, difficulty)}
              className="w-full py-4 text-black font-black text-xl rounded-xl transition-shadow"
              style={{
                background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                boxShadow: '0 0 24px rgba(234,179,8,0.5)',
              }}
            >
              ⚔️ JOGAR
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Rules summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-4xl w-full rounded-xl p-4 relative z-10"
        style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="text-sm font-bold text-slate-300 mb-2">Regras Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
          <div>🏆 <strong className="text-white">10 pontos</strong> para vencer</div>
          <div>⚡ Qualquer carta vira energia (1x/turno)</div>
          <div>🛡️ Pokémon começa <span className="text-green-400">PRONTO</span> no seu turno</div>
          <div>⚔️ Atacar torna o Pokémon <span className="text-red-400">VULNERÁVEL</span></div>
          <div>🔄 Contra-ataque simultâneo ao ataque</div>
          <div>📦 Deck out = derrota</div>
          <div>🃏 60 cartas, max 4 cópias</div>
          <div>🦊 Máx 5 Pokémon em jogo</div>
        </div>
      </motion.div>
    </div>
  );
}
