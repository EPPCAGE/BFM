import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { STARTER_DECKS } from '../data/decks';
import { POKEMON_CARDS } from '../data/cards';
import { CardImage } from './CardImage';
import type { PokemonCardDef } from '../game/types';

const TYPE_ICON: Record<string, string> = {
  'chamas-da-coragem':   '🔥',
  'mentes-misteriosas':  '🔮',
  'tempestade-eletrica': '⚡',
  'sombras-ancestrais':  '👻',
  'abismo-aquatico':     '🌊',
  'sombras-negras':      '🌑',
  'furia-draconica':     '🐉',
  'coracao-de-aco':      '⚙️',
  'encanto-das-fadas':   '✨',
  'forca-da-natureza':   '🌿',
};

const TYPE_COLOR: Record<string, string> = {
  'chamas-da-coragem':   '#f97316',
  'mentes-misteriosas':  '#a855f7',
  'tempestade-eletrica': '#eab308',
  'sombras-ancestrais':  '#8b5cf6',
  'abismo-aquatico':     '#3b82f6',
  'sombras-negras':      '#6b7280',
  'furia-draconica':     '#6366f1',
  'coracao-de-aco':      '#9ca3af',
  'encanto-das-fadas':   '#ec4899',
  'forca-da-natureza':   '#22c55e',
};

const DIFF_OPTIONS = [
  { key: 'easy',       label: 'Fácil',        icon: '🟢' },
  { key: 'medium',     label: 'Médio',        icon: '🟡' },
  { key: 'hard',       label: 'Difícil',      icon: '🔴' },
  { key: 'extra-hard', label: 'Lendário',     icon: '💀' },
] as const;

type Difficulty = 'easy' | 'medium' | 'hard' | 'extra-hard';

export function MainMenu() {
  const { startGame } = useGameStore();
  const [playerDeck, setPlayerDeck] = useState(STARTER_DECKS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const aiDeckId = STARTER_DECKS.find(d => d.id !== playerDeck)?.id ?? STARTER_DECKS[1].id;

  const deckDef = STARTER_DECKS.find(d => d.id === playerDeck)!;
  const accentColor = TYPE_COLOR[playerDeck] ?? '#fbbf24';

  const previewPokemon = [...new Set(deckDef.cards.filter(id => POKEMON_CARDS.find(p => p.id === id)))]
    .slice(0, 5)
    .map(id => POKEMON_CARDS.find(p => p.id === id)!)
    .filter(Boolean) as PokemonCardDef[];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #12172e 0%, #070a14 100%)' }}>

      {/* Subtle ambient glow behind logo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${accentColor}22 0%, transparent 70%)`, transition: 'background 0.6s ease' }} />
      </div>

      <motion.div className="relative z-10 w-full max-w-5xl px-4 py-8 flex flex-col gap-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* ── Logo ── */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-widest"
            style={{ color: accentColor, textShadow: `0 0 40px ${accentColor}88`, transition: 'color 0.6s, text-shadow 0.6s' }}>
            LORKEMON
          </h1>
          <p className="text-slate-500 text-xs mt-1 tracking-widest uppercase">TCG Digital</p>
        </div>

        {/* ── Main row: deck picker + preview + options ── */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">

          {/* LEFT — deck grid */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Seu Deck</span>
            <div className="grid grid-cols-2 gap-1.5">
              {STARTER_DECKS.map(deck => {
                const active = deck.id === playerDeck;
                const color = TYPE_COLOR[deck.id] ?? '#888';
                return (
                  <button key={deck.id} onClick={() => setPlayerDeck(deck.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 text-sm font-semibold"
                    style={{
                      background: active ? `${color}22` : 'rgba(15,23,42,0.6)',
                      border: `1px solid ${active ? color : 'rgba(255,255,255,0.07)'}`,
                      color: active ? '#fff' : '#94a3b8',
                      boxShadow: active ? `0 0 14px ${color}44` : 'none',
                    }}>
                    <span style={{ fontSize: 16 }}>{TYPE_ICON[deck.id] ?? '🃏'}</span>
                    <span className="truncate">{deck.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER — animated card preview */}
          <div className="flex flex-col items-center gap-3 min-w-[160px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Preview</span>
            <div className="relative flex items-end justify-center" style={{ height: 160, width: 160 }}>
              <AnimatePresence mode="wait">
                {previewPokemon.map((p, i) => {
                  const n = previewPokemon.length;
                  const mid = (n - 1) / 2;
                  const rot = (i - mid) * 8;
                  const tx = (i - mid) * 22;
                  return (
                    <motion.div key={`${playerDeck}-${p.id}`}
                      initial={{ opacity: 0, y: 20, rotate: rot, x: tx }}
                      animate={{ opacity: 1, y: 0, rotate: rot, x: tx }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="absolute rounded-lg overflow-hidden shadow-2xl"
                      style={{ width: 64, height: 90, bottom: 0,
                        boxShadow: i === Math.floor(n / 2) ? `0 0 20px ${accentColor}66` : '0 4px 16px rgba(0,0,0,0.6)',
                        zIndex: i === Math.floor(n / 2) ? 10 : 5 - Math.abs(i - Math.floor(n / 2)) }}>
                      <CardImage card={p} className="w-full h-full" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white">{deckDef.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[160px]">{deckDef.description}</p>
            </div>
          </div>

          {/* RIGHT — difficulty + start */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dificuldade</span>
            <div className="grid grid-cols-2 gap-1.5">
              {DIFF_OPTIONS.map(({ key, label, icon }) => {
                const active = difficulty === key;
                return (
                  <button key={key} onClick={() => setDifficulty(key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: active ? 'rgba(250,204,21,0.15)' : 'rgba(15,23,42,0.6)',
                      border: `1px solid ${active ? '#fbbf24' : 'rgba(255,255,255,0.07)'}`,
                      color: active ? '#fde047' : '#94a3b8',
                      boxShadow: active ? '0 0 14px rgba(251,191,36,0.3)' : 'none',
                    }}>
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* IA deck info */}
            <div className="mt-1 px-3 py-2 rounded-xl text-xs text-slate-400"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              IA jogará com <span className="text-white font-semibold">{STARTER_DECKS.find(d => d.id === aiDeckId)?.name}</span>
            </div>

            {/* Start button */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={() => startGame(playerDeck, aiDeckId, difficulty)}
              className="mt-2 w-full py-3.5 text-black font-black text-lg rounded-2xl tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                boxShadow: `0 0 28px ${accentColor}66`,
                transition: 'background 0.6s, box-shadow 0.6s',
              }}>
              ⚔️ JOGAR
            </motion.button>
          </div>
        </div>

        {/* ── Rules — compact single line chips ── */}
        <div className="flex flex-wrap justify-center gap-2 opacity-50">
          {['🏆 10 pts para vencer','⚡ Qualquer carta = energia','⚔️ Atacar → Vulnerável','🔄 Contra-ataque simultâneo','🦊 Máx 5 em jogo','🃏 60 cartas / max 4 cópias'].map(r => (
            <span key={r} className="text-[10px] text-slate-400 px-2 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>{r}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
