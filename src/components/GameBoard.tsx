import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameLog } from './GameLog';
import { PlayZone } from './PlayZone';
import { CardImage } from './CardImage';
import { CardTooltip } from './CardTooltip';
import { DeckSearchModal } from './DeckSearchModal';
import { HintPanel } from './HintPanel';
import { TurnBanner } from './TurnBanner';
import { canAttack, canSynergyAttack, getSynergyGroup, getSynergyDamage } from '../game/engine';
import { useTooltip } from '../hooks/useTooltip';
import { playSound } from '../utils/sounds';
import type { PokemonCardDef, Attack } from '../game/types';
import type { DamageEvent } from './DamageNumber';

type PendingTrainer = { cardId: string; targetType: 'friendly' | 'enemy' } | null;
type CardMenu = { idx: number; x: number; y: number } | null;

const FRIENDLY_TARGET_TRAINERS = new Set(['potion', 'super-potion', 'switch', 'rare-candy']);
const ENEMY_TARGET_TRAINERS = new Set(['bosss-orders']);
const CARD_BACK_URL = 'https://images.pokemontcg.io/back.png';

export function GameBoard() {
  const {
    gameState, endTurnAction,
    playEnergyFromHandAction,
    summonAction, attackAction, abilityAttackAction, evolveAction, playTrainerAction,
    completeDeckSearchAction, copiedAttackAction, synergyAttackAction, resetGame,
  } = useGameStore();

  const [attackMode, setAttackMode] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);
  const [pendingTrainer, setPendingTrainer] = useState<PendingTrainer>(null);
  const [pendingTeleport, setPendingTeleport] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);
  const [cardMenu, setCardMenu] = useState<CardMenu>(null);
  const [logOpen, setLogOpen] = useState(true);
  const [mewCopyMode, setMewCopyMode] = useState<string | null>(null);
  const [mewCopiedAttack, setMewCopiedAttack] = useState<Attack | null>(null);
  const [synergyMode, setSynergyMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Visual fx state ──
  const [damageEvents, setDamageEvents] = useState<Record<string, DamageEvent[]>>({});
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [evolvingCard, setEvolvingCard] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem('lorkemon-muted') === '1');
  const prevHpRef = useRef<Record<string, number>>({});
  const prevEvoRef = useRef<Record<string, number>>({});
  const prevPlayerRef = useRef<string | null>(null);

  const addDamageEvent = useCallback((instanceId: string, delta: number) => {
    const evId = `${instanceId}-${Date.now()}-${Math.random()}`;
    setDamageEvents(prev => ({
      ...prev,
      [instanceId]: [...(prev[instanceId] ?? []), { id: evId, delta }],
    }));
  }, []);

  const removeDamageEvent = useCallback((instanceId: string, evId: string) => {
    setDamageEvents(prev => ({
      ...prev,
      [instanceId]: (prev[instanceId] ?? []).filter(e => e.id !== evId),
    }));
  }, []);

  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Close menu on outside click
  useEffect(() => {
    if (!cardMenu) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setCardMenu(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [cardMenu]);

  const prevResultRef = useRef<string | null>(null);
  const prevLogLenRef = useRef(0);
  useEffect(() => {
    if (!gameState) return;

    // ── Result sound ──
    if (gameState.result && gameState.result !== prevResultRef.current) {
      prevResultRef.current = gameState.result;
      playSound(gameState.result === 'player_wins' ? 'win' : 'ko');
    }

    // ── Log-based sounds ──
    const newEntries = gameState.log.slice(prevLogLenRef.current);
    prevLogLenRef.current = gameState.log.length;
    for (const e of newEntries) {
      const m = e.message;
      if (m.includes('derrotado')) playSound('ko');
      else if (m.includes('usou') && m.includes('dano')) playSound('attack');
      else if (m.includes('invocou')) playSound('summon');
      else if (m.includes('evoluiu') || m.includes('Evo')) playSound('evolve');
    }

    // ── HP delta → damage numbers + shake ──
    const allPokemon = [
      ...gameState.players.player.playArea,
      ...gameState.players.ai.playArea,
    ];
    for (const pk of allPokemon) {
      const prev = prevHpRef.current[pk.instanceId];
      if (prev !== undefined && prev !== pk.currentHp) {
        const delta = pk.currentHp - prev;
        addDamageEvent(pk.instanceId, delta);
        if (delta < 0) {
          setShakingCard(pk.instanceId);
          setTimeout(() => setShakingCard(s => s === pk.instanceId ? null : s), 500);
        }
      }
      prevHpRef.current[pk.instanceId] = pk.currentHp;

      // ── Evolution glow ──
      const prevEvoLen = prevEvoRef.current[pk.instanceId] ?? 1;
      if (pk.evolutionStack.length > prevEvoLen) {
        setEvolvingCard(pk.instanceId);
        setTimeout(() => setEvolvingCard(e => e === pk.instanceId ? null : e), 750);
      }
      prevEvoRef.current[pk.instanceId] = pk.evolutionStack.length;
    }

    // ── Turn change banner ──
    if (prevPlayerRef.current && prevPlayerRef.current !== gameState.currentPlayer) {
      // TurnBanner handles this via its own effect
    }
    prevPlayerRef.current = gameState.currentPlayer;
  });

  if (!gameState) return null;

  const { players, turn, currentPlayer, result, aiThinking } = gameState;
  const isPlayerTurn = currentPlayer === 'player';
  const playerState = players.player;
  const aiState = players.ai;

  // ── Card action menu ──
  const menuCard = cardMenu !== null ? playerState.hand[cardMenu.idx] : null;
  const menuOptions: { label: string; action: 'energy' | 'summon' | 'trainer' }[] = [];
  if (menuCard) {
    const isBasic = menuCard.type === 'pokemon' && (menuCard as PokemonCardDef).stage === 'Basic';
    const isTrainer = menuCard.type === 'item' || menuCard.type === 'supporter';
    if (isBasic) menuOptions.push({ label: '🐾 Invocar Pokémon', action: 'summon' });
    if (isTrainer) menuOptions.push({ label: '🃏 Jogar Treinador', action: 'trainer' });
    if (!playerState.energyPlayedThisTurn) menuOptions.push({ label: '⚡ Usar como Energia', action: 'energy' });
  }

  function commitAction(action: 'energy' | 'summon' | 'trainer') {
    if (!cardMenu) return;
    const idx = cardMenu.idx;
    const card = playerState.hand[idx];
    setCardMenu(null);
    if (action === 'energy') {
      playSound('energy');
      playEnergyFromHandAction(idx);
    } else if (action === 'summon') {
      playSound('summon');
      summonAction(card.id);
    } else if (action === 'trainer') {
      playSound('trainer');
      if (FRIENDLY_TARGET_TRAINERS.has(card.id)) setPendingTrainer({ cardId: card.id, targetType: 'friendly' });
      else if (ENEMY_TARGET_TRAINERS.has(card.id)) setPendingTrainer({ cardId: card.id, targetType: 'enemy' });
      else playTrainerAction(card.id);
    }
  }

  function handleHandClick(idx: number, e: React.MouseEvent) {
    if (!isPlayerTurn) return;
    const card = playerState.hand[idx];
    if (!card) return;
    if (pendingTeleport) {
      if (card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic') {
        playSound('card');
        abilityAttackAction(pendingTeleport.attackerInstanceId, pendingTeleport.attackIndex, idx);
        setPendingTeleport(null);
      }
      return;
    }
    hideTooltip();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCardMenu({ idx, x: rect.left, y: rect.top });
  }

  function handleAttack(attackerInstanceId: string, attackIndex: number) {
    if (!gameState) return;
    const attacker = gameState.players.player.playArea.find(pk => pk.instanceId === attackerInstanceId);
    const attack = attacker?.def.attacks[attackIndex];
    if (attack && attack.damage === 0 && attack.effectType) {
      if (attack.effectType === 'teleport') setPendingTeleport({ attackerInstanceId, attackIndex });
      else abilityAttackAction(attackerInstanceId, attackIndex);
      return;
    }
    if (!canAttack(gameState, 'player', attackerInstanceId, attackIndex)) return;
    setAttackMode({ attackerInstanceId, attackIndex });
  }

  function handleSelectAttackTarget(targetInstanceId: string) {
    if (synergyMode) {
      synergyAttackAction(targetInstanceId);
      setSynergyMode(false);
      return;
    }
    if (mewCopyMode && mewCopiedAttack) {
      copiedAttackAction(mewCopyMode, mewCopiedAttack, targetInstanceId);
      setMewCopyMode(null);
      setMewCopiedAttack(null);
      setAttackMode(null);
      return;
    }
    if (!attackMode) return;
    attackAction(attackMode.attackerInstanceId, attackMode.attackIndex, targetInstanceId);
    setAttackMode(null);
  }

  function handleSelectTrainerTarget(targetInstanceId: string) {
    if (!pendingTrainer) return;
    playTrainerAction(pendingTrainer.cardId, targetInstanceId);
    setPendingTrainer(null);
  }

  const cancelMode = attackMode || pendingTrainer || pendingTeleport || mewCopyMode || synergyMode;
  const synergyGroup = isPlayerTurn ? getSynergyGroup(gameState, 'player') : [];
  const synergyAvailable = isPlayerTurn && !synergyMode && canSynergyAttack(gameState, 'player');
  const synergyDmg = synergyGroup.length >= 4 ? getSynergyDamage(synergyGroup) : 0;
  const aiDiscard = [...aiState.discardPile].reverse().slice(0, 8);
  const playerDiscard = [...playerState.discardPile].reverse().slice(0, 8);

  return (
    <div className="flex flex-col h-screen tcg-mat overflow-hidden">

      <TurnBanner currentPlayer={currentPlayer} turn={turn} />

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0"
        style={{ background: 'linear-gradient(180deg,rgba(2,6,23,0.97) 0%,rgba(10,18,40,0.95) 100%)', borderBottom: '1px solid rgba(251,191,36,0.2)' }}>
        <div className="flex items-center gap-4">
          <h1 className="text-base font-black tracking-widest"
            style={{ background: 'linear-gradient(135deg,#fde047,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }}>
            LORKEMON
          </h1>
          <span className="text-xs text-slate-500">TURNO <span className="text-white font-bold">{turn}</span></span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isPlayerTurn ? 'bg-blue-700 text-white' : 'bg-red-800 text-white'}`}>
            {isPlayerTurn ? '● Sua vez' : '● Vez da IA'}
          </span>
          {aiThinking && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="ai-dots">IA pensando</span>
            </span>
          )}
          <span className="text-xs text-slate-400">Você: <strong className="text-blue-300">{playerState.points}</strong>/10</span>
          <span className="text-xs text-slate-400">IA: <strong className="text-red-300">{aiState.points}</strong>/10</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              localStorage.setItem('lorkemon-muted', next ? '1' : '0');
            }}
            className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.4)' }}
            title={muted ? 'Ativar som' : 'Silenciar'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={() => setLogOpen(o => !o)}
            className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.4)' }}>
            {logOpen ? '◀ Log' : '▶ Log'}
          </button>
          {cancelMode && (
            <button onClick={() => { setAttackMode(null); setPendingTrainer(null); setPendingTeleport(null); setMewCopyMode(null); setMewCopiedAttack(null); setSynergyMode(false); }}
              className="px-3 py-1 text-xs font-semibold rounded text-slate-300 hover:text-white"
              style={{ background: 'rgba(71,85,105,0.6)', border: '1px solid rgba(100,116,139,0.4)' }}>
              ✕ Cancelar
            </button>
          )}
          {synergyAvailable && !aiThinking && gameState.phase !== 'end' && (
            <button onClick={() => setSynergyMode(true)}
              className="px-3 py-1.5 text-xs font-black rounded text-black hover:scale-105 active:scale-95 transition-transform animate-pulse"
              style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', boxShadow: '0 0 16px rgba(168,85,247,0.7)', border: '1px solid rgba(232,121,249,0.5)' }}
              title={`${synergyGroup.length}× ${synergyGroup[0]?.def.pokemonType} → ${synergyDmg} dano combinado`}>
              ✦ Ataque Sinérgico ({synergyDmg}⚡)
            </button>
          )}
          {isPlayerTurn && !cancelMode && !aiThinking && gameState.phase !== 'end' && (
            <button onClick={endTurnAction}
              className="px-4 py-1.5 text-sm font-black rounded text-white hover:scale-105 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', boxShadow: '0 0 12px rgba(22,163,74,0.5)', border: '1px solid rgba(74,222,128,0.3)' }}>
              Encerrar Turno →
            </button>
          )}
          <button onClick={resetGame}
            className="px-3 py-1 text-xs rounded text-slate-400 hover:text-white"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.4)' }}>
            Sair
          </button>
        </div>
      </div>

      {/* ── CONTEXT BANNER ── */}
      {synergyMode && <div className="bg-yellow-700/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-yellow-500/40">⚡ Ataque Sinérgico: selecione um Pokémon VULNERÁVEL do oponente como alvo</div>}
      {mewCopyMode && !mewCopiedAttack && <div className="bg-yellow-900/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-yellow-600/40">🌟 Baú de DNA: selecione um ataque do painel de Pokémon em jogo</div>}
      {mewCopyMode && mewCopiedAttack && <div className="bg-orange-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-orange-600/40">🌟 Mew copia "{mewCopiedAttack.name}": selecione um alvo VULNERÁVEL</div>}
      {attackMode && !mewCopyMode && <div className="bg-orange-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-orange-600/40">⚔️ Selecione um Pokémon VULNERÁVEL do oponente para atacar</div>}
      {pendingTeleport && <div className="bg-indigo-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-indigo-600/40">🌀 Teletransporte: clique em um Pokémon Básico da sua mão</div>}
      {pendingTrainer?.targetType === 'friendly' && <div className="bg-green-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-green-600/40">💊 Selecione um de seus Pokémon como alvo</div>}
      {pendingTrainer?.targetType === 'enemy' && <div className="bg-purple-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-purple-600/40">🎯 Ordens do Chefe: selecione um Pokémon PRONTO do oponente</div>}
      {gameState.pendingFreeSummon && <div className="bg-teal-800/80 text-white text-sm text-center py-1 flex-shrink-0 font-semibold border-b border-teal-600/40">🔄 Switch: clique em um Pokémon Básico da sua mão para invocar</div>}

      {/* ── DECK SEARCH MODAL ── */}
      {gameState.pendingDeckSearch && (
        <DeckSearchModal search={gameState.pendingDeckSearch} onSelect={completeDeckSearchAction} />
      )}

      {/* ── RESULT OVERLAY ── */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            background: result === 'player_wins'
              ? 'radial-gradient(ellipse at center, rgba(161,120,0,0.35) 0%, rgba(2,6,23,0.92) 60%)'
              : 'radial-gradient(ellipse at center, rgba(120,10,10,0.4) 0%, rgba(2,6,23,0.92) 60%)',
            backdropFilter: 'blur(10px)',
          }}>
          <div className="victory-pop text-center px-16 py-12 rounded-3xl"
            style={{
              background: result === 'player_wins'
                ? 'linear-gradient(135deg,rgba(20,20,5,0.97),rgba(40,35,10,0.97))'
                : 'linear-gradient(135deg,rgba(20,5,5,0.97),rgba(40,10,10,0.97))',
              border: result === 'player_wins' ? '1px solid rgba(251,191,36,0.6)' : '1px solid rgba(239,68,68,0.6)',
              boxShadow: result === 'player_wins'
                ? '0 0 80px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 0 80px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            <div className="text-8xl mb-4" style={{ filter: result === 'player_wins' ? 'drop-shadow(0 0 20px rgba(250,204,21,0.8))' : 'drop-shadow(0 0 20px rgba(239,68,68,0.8))' }}>
              {result === 'player_wins' ? '🏆' : '💀'}
            </div>
            <h2 className="text-5xl font-black mb-3"
              style={{ color: result === 'player_wins' ? '#fde047' : '#f87171', textShadow: result === 'player_wins' ? '0 0 30px rgba(250,204,21,0.7)' : '0 0 30px rgba(239,68,68,0.7)' }}>
              {result === 'player_wins' ? 'VITÓRIA!' : 'DERROTA'}
            </h2>
            <p className="text-slate-400 mb-8 text-sm">
              Turno {turn} · Você: <strong className="text-blue-300">{playerState.points}</strong> pts · IA: <strong className="text-red-300">{aiState.points}</strong> pts
            </p>
            <button onClick={resetGame}
              className="px-10 py-3 font-black text-lg rounded-2xl text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#fde047,#f59e0b)', boxShadow: '0 0 24px rgba(251,191,36,0.7)' }}>
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── LEFT: energy pools ── */}
        <div className="w-16 flex-shrink-0 flex flex-col" style={{ background: 'rgba(2,6,23,0.7)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1 border-b border-slate-800">
            <span className="text-[8px] text-red-400 font-bold">IA ⚡</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 150 }}>
              {aiState.energyPool.map((e) => (
                <div key={e.instanceId} className={`rounded overflow-hidden transition-all ${e.used ? 'opacity-30' : ''}`} style={{ width: 28, height: 39, transform: e.used ? 'rotate(90deg)' : 'none' }}>
                  <img src={CARD_BACK_URL} alt="e" className="w-full h-full object-cover" />
                </div>
              ))}
              {aiState.energyPool.length === 0 && <span className="text-slate-700 text-[8px]">–</span>}
            </div>
            <span className="text-[8px] text-yellow-400 font-bold">{aiState.energyPool.filter(e => !e.used).length}/{aiState.energyPool.length}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1">
            <span className="text-[8px] text-blue-400 font-bold">⚡ Você</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 150 }}>
              {playerState.energyPool.map((e) => (
                <div key={e.instanceId} className={`rounded overflow-hidden transition-all ${e.used ? 'opacity-30' : ''}`} style={{ width: 28, height: 39, transform: e.used ? 'rotate(90deg)' : 'none' }}>
                  <img src={CARD_BACK_URL} alt="e" className="w-full h-full object-cover" />
                </div>
              ))}
              {playerState.energyPool.length === 0 && <span className="text-slate-700 text-[8px]">–</span>}
            </div>
            <span className="text-[8px] text-yellow-400 font-bold">{playerState.energyPool.filter(e => !e.used).length}/{playerState.energyPool.length}</span>
          </div>
        </div>

        {/* ── CENTER ── */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">

          {/* Opponent hand + discard */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5"
            style={{ minHeight: 88, background: 'rgba(69,10,10,0.35)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-400 font-bold flex-shrink-0">IA ({aiState.hand.length})</span>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide">
              <div className="flex items-end">
                {aiState.hand.map((_, idx) => (
                  <div key={idx} className="flex-shrink-0 rounded overflow-hidden shadow-lg"
                    style={{ width: 52, height: 73, marginLeft: idx === 0 ? 0 : -20 }}>
                    <img src={CARD_BACK_URL} alt="carta" className="w-full h-full object-cover" />
                  </div>
                ))}
                {aiState.hand.length === 0 && <span className="text-slate-600 text-xs italic">Mão vazia</span>}
              </div>
            </div>
            {/* AI discard */}
            <div className="flex-shrink-0 flex flex-col items-end">
              <span className="text-[8px] text-slate-500 mb-0.5">DESCARTE ({aiState.discardPile.length})</span>
              <div className="flex gap-0.5 flex-wrap justify-end" style={{ maxWidth: 230 }}>
                {aiDiscard.map((card, i) => (
                  <div key={i} data-card-hover className="rounded overflow-hidden flex-shrink-0 relative cursor-default"
                    style={{ width: 38, height: 53, opacity: i === 0 ? 1 : 0.75 - i * 0.05 }}
                    onMouseEnter={(e) => showTooltip(card, e)} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}>
                    <CardImage card={card} className="w-full h-full" />
                    {i === 0 && <div className="absolute top-0 left-0 right-0 text-center text-[7px] bg-yellow-500/80 text-black font-bold leading-tight">TOPO</div>}
                  </div>
                ))}
                {aiDiscard.length === 0 && <div className="rounded border border-dashed border-slate-700 flex items-center justify-center" style={{ width: 38, height: 53 }}><span className="text-slate-700 text-[7px]">–</span></div>}
              </div>
            </div>
            {/* AI deck */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="rounded overflow-hidden" style={{ width: 32, height: 45 }}>
                <img src={CARD_BACK_URL} alt="deck" className="w-full h-full object-cover" />
              </div>
              <span className="text-[7px] text-slate-500">{aiState.deckCards.length}</span>
            </div>
          </div>

          {/* AI play zone */}
          <div className="flex-1 flex flex-col items-center justify-center relative"
            style={{ minHeight: 180, background: 'linear-gradient(180deg,rgba(10,18,40,0.5) 0%,rgba(60,10,10,0.25) 100%)' }}>
            <div className="absolute top-1 left-3 text-[10px] text-red-400 font-bold z-10">IA — Em Jogo ({aiState.playArea.length}/5)</div>
            {aiThinking && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2"
                  style={{ background: 'rgba(10,10,30,0.75)', border: '1px solid rgba(239,68,68,0.25)', backdropFilter: 'blur(4px)' }}>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="ai-dots">IA calculando</span>
                </div>
              </div>
            )}
            <PlayZone
              playerState={aiState} isCurrentPlayer={currentPlayer === 'ai'} isOpponent={true}
              attackMode={attackMode ?? (mewCopiedAttack ? { attackerInstanceId: mewCopyMode ?? '', attackIndex: 0 } : null) ?? (synergyMode ? { attackerInstanceId: '', attackIndex: 0 } : null)}
              onSelectAttackTarget={handleSelectAttackTarget}
              pendingTrainer={pendingTrainer} onSelectTrainerTarget={handleSelectTrainerTarget}
              cardSize="large"
              damageEvents={damageEvents}
              onDamageEventDone={removeDamageEvent}
              shakingCard={shakingCard}
              evolvingCard={evolvingCard}
            />
          </div>

          {/* Divider */}
          <div className="board-divider flex-shrink-0" />

          {/* Player play zone */}
          <div className="flex-1 flex flex-col items-center justify-center relative"
            style={{ minHeight: 180, background: 'linear-gradient(180deg,rgba(23,37,84,0.3) 0%,rgba(10,18,40,0.5) 100%)' }}>
            <div className="absolute top-1 left-3 text-[10px] text-blue-400 font-bold z-10">Você — Em Jogo ({playerState.playArea.length}/5)</div>

            {/* ── Synergy energy art overlay ── */}
            {synergyGroup.length >= 4 && (synergyMode || synergyAvailable) && (
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded">
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 60%, rgba(168,85,247,${synergyMode ? 0.22 : 0.07}) 0%, transparent 70%)` }} />
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7"/><stop offset="50%" stopColor="#ec4899"/><stop offset="100%" stopColor="#6366f1"/>
                    </linearGradient>
                    <filter id="sglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  {synergyGroup.map((pk, i) => {
                    if (i === synergyGroup.length - 1) return null;
                    const total = Math.max(playerState.playArea.length, 1);
                    const step = 100 / (total + 1);
                    const idx1 = playerState.playArea.findIndex(p => p.instanceId === synergyGroup[i].instanceId);
                    const idx2 = playerState.playArea.findIndex(p => p.instanceId === synergyGroup[i + 1].instanceId);
                    const x1 = (idx1 + 1) * step;
                    const x2 = (idx2 + 1) * step;
                    const mx = (x1 + x2) / 2;
                    return (
                      <g key={pk.instanceId} filter="url(#sglow)">
                        <path d={`M ${x1}% 55% Q ${mx}% 15%, ${x2}% 55%`}
                          stroke="url(#sg1)" strokeWidth={synergyMode ? '3' : '1.5'} fill="none" strokeDasharray="8 4">
                          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="0.7s" repeatCount="indefinite"/>
                        </path>
                        <circle cx={`${mx}%`} cy="25%" r={synergyMode ? '5' : '3'} fill="#ec4899">
                          <animate attributeName="r" values={synergyMode ? '4;7;4' : '2;4;2'} dur="1s" repeatCount="indefinite"/>
                          <animate attributeName="fill" values="#ec4899;#a855f7;#ec4899" dur="1.4s" repeatCount="indefinite"/>
                        </circle>
                      </g>
                    );
                  })}
                  {synergyMode && (
                    <circle cx="50%" cy="50%" r="20" fill="none" stroke="#a855f7" strokeWidth="2">
                      <animate attributeName="r" values="10;40;10" dur="1.5s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                  )}
                </svg>
                {synergyMode && (
                  <div className="absolute bottom-2 inset-x-0 flex justify-center">
                    <span className="text-[11px] font-black px-3 py-1 rounded-full"
                      style={{ background: 'rgba(88,28,135,0.9)', color: '#f0abfc', boxShadow: '0 0 16px rgba(168,85,247,0.8)', border: '1px solid rgba(216,180,254,0.4)' }}>
                      ✦ {synergyGroup.length}× {synergyGroup[0]?.def.pokemonType} · {synergyDmg} dano · Selecione o alvo ↑
                    </span>
                  </div>
                )}
              </div>
            )}

            <PlayZone
              playerState={playerState} isCurrentPlayer={isPlayerTurn} isOpponent={false}
              onAttack={handleAttack} onEvolve={evolveAction}
              attackMode={attackMode} pendingTrainer={pendingTrainer}
              onSelectTrainerTarget={handleSelectTrainerTarget}
              onMewAbility={(instanceId) => { setMewCopyMode(instanceId); }}
              cardSize="large"
              damageEvents={damageEvents}
              onDamageEventDone={removeDamageEvent}
              shakingCard={shakingCard}
              evolvingCard={evolvingCard}
            />
          </div>

          {/* Mew DNA panel */}
          {mewCopyMode && !mewCopiedAttack && (
            <div className="flex-shrink-0 bg-yellow-950/90 border-t border-yellow-700/50 px-4 py-2">
              <p className="text-yellow-300 text-xs font-bold mb-1">🌟 Baú de DNA — Escolha um ataque para copiar:</p>
              <div className="flex flex-wrap gap-2 overflow-x-auto">
                {[...gameState.players.player.playArea, ...gameState.players.ai.playArea].map(pk => (
                  <div key={pk.instanceId} className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold">{pk.def.displayName}</span>
                    {pk.def.attacks.filter(a => a.damage > 0).map((atk, i) => (
                      <button key={i}
                        onClick={() => { setMewCopiedAttack(atk); }}
                        className="text-[9px] px-2 py-0.5 rounded bg-yellow-800 hover:bg-yellow-600 text-white text-left">
                        {atk.name} <span className="text-yellow-300">{atk.cost}⚡</span> <span className="text-red-300">{atk.damage}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player hand + discard */}
          <div className="flex-shrink-0 flex items-end gap-2 px-3 py-2"
            style={{ minHeight: 172, background: 'rgba(15,23,60,0.6)', borderTop: '1px solid rgba(99,130,255,0.2)' }}>
            {/* Deck + discard */}
            <div className="flex-shrink-0 flex flex-col gap-1">
              <div className="flex gap-1.5 items-end">
                {/* Deck */}
                <div className="flex flex-col items-center">
                  <div className="rounded overflow-hidden" style={{ width: 36, height: 50 }} title="Deck">
                    <img src={CARD_BACK_URL} alt="deck" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[7px] text-slate-500">{playerState.deckCards.length}</span>
                </div>
                {/* Discard */}
                <div className="flex flex-col items-center">
                  {playerState.discardPile.length > 0 ? (
                    <div data-card-hover
                      className="rounded overflow-hidden"
                      style={{ width: 36, height: 50 }}
                      title="Topo do descarte"
                      onMouseEnter={(e) => showTooltip(playerState.discardPile[playerState.discardPile.length - 1], e)}
                      onMouseMove={moveTooltip} onMouseLeave={hideTooltip}>
                      <CardImage card={playerState.discardPile[playerState.discardPile.length - 1]} className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-slate-700 flex items-center justify-center" style={{ width: 36, height: 50 }}>
                      <span className="text-slate-700 text-[7px]">–</span>
                    </div>
                  )}
                  <span className="text-[7px] text-slate-500">{playerState.discardPile.length}</span>
                </div>
              </div>
              {/* Discard pile thumbnails */}
              <span className="text-[8px] text-slate-500">DESCARTE</span>
              <div className="flex flex-wrap gap-0.5" style={{ maxWidth: 200 }}>
                {playerDiscard.map((card, i) => (
                  <div key={i} data-card-hover className="rounded overflow-hidden flex-shrink-0 relative"
                    style={{ width: 38, height: 53, opacity: i === 0 ? 1 : 0.75 - i * 0.05 }}
                    onMouseEnter={(e) => showTooltip(card, e)} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}>
                    <CardImage card={card} className="w-full h-full" />
                    {i === 0 && <div className="absolute top-0 left-0 right-0 text-center text-[7px] bg-yellow-500/80 text-black font-bold leading-tight">TOPO</div>}
                  </div>
                ))}
                {playerDiscard.length === 0 && <div className="rounded border border-dashed border-slate-700 flex items-center justify-center" style={{ width: 38, height: 53 }}><span className="text-slate-700 text-[7px]">–</span></div>}
              </div>
            </div>

            {/* Hand cards */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-300 font-bold">Mão ({playerState.hand.length})</span>
                {isPlayerTurn && <span className="text-[10px] text-slate-400">— clique em uma carta para ações</span>}
                {!isPlayerTurn && <span className="text-[10px] text-slate-500 italic">Aguardando IA…</span>}
              </div>
              <div className="hand-fan gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {playerState.hand.map((card, idx) => {
                  const isTeleportTarget = pendingTeleport && card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic';
                  const isMenuOpen = cardMenu?.idx === idx;
                  return (
                    <div key={`${card.id}-${idx}`} data-card-hover
                      className={`relative card-in-hand rounded-lg cursor-pointer flex-shrink-0 shadow-xl
                        ${isTeleportTarget ? 'ring-2 ring-indigo-400 animate-pulse' : ''}
                        ${isMenuOpen ? 'ring-2 ring-yellow-400 scale-105' : ''}`}
                      style={{ width: 108, height: 151 }}
                      onClick={(e) => handleHandClick(idx, e)}
                      onMouseEnter={(e) => { if (!cardMenu) showTooltip(card, e); }}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}>
                      <CardImage card={card} className="w-full h-full rounded-lg" />
                      {card.type === 'item' && <div className="absolute bottom-0 left-0 right-0 bg-amber-700/85 text-[8px] text-center text-white rounded-b font-semibold">ITEM</div>}
                      {card.type === 'supporter' && <div className="absolute bottom-0 left-0 right-0 bg-purple-700/85 text-[8px] text-center text-white rounded-b font-semibold">APOIADOR</div>}
                    </div>
                  );
                })}
                {playerState.hand.length === 0 && <span className="text-slate-500 text-sm italic py-10">Mão vazia</span>}
              </div>
            </div>
          </div>

        </div>{/* end center */}

        {/* ── RIGHT SIDEBAR ── */}
        {logOpen && (
          <div className="w-56 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: 'rgba(2,6,23,0.7)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Painel</span>
              <button onClick={() => setLogOpen(false)} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
            </div>
            <div className="flex-shrink-0" style={{ maxHeight: '40%', overflowY: 'auto' }}>
              <HintPanel gameState={gameState} />
            </div>
            <div className="flex-1 overflow-hidden border-t border-slate-800">
              <GameLog entries={gameState.log} />
            </div>
          </div>
        )}

      </div>{/* end main area */}

      {/* ── CARD ACTION MENU ── */}
      {cardMenu && menuOptions.length > 0 && (
        <div ref={menuRef} className="fixed z-50 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5"
          style={{
            left: cardMenu.x,
            top: Math.max(8, cardMenu.y - menuOptions.length * 44 - 12),
            background: 'linear-gradient(145deg,#1e293b,#0f172a)',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          }}>
          {menuOptions.map(opt => (
            <button key={opt.action} onClick={() => commitAction(opt.action)}
              className="text-left text-sm text-white px-4 py-2.5 rounded-lg hover:bg-white/10 whitespace-nowrap font-semibold transition-colors">
              {opt.label}
            </button>
          ))}
          <div className="h-px bg-white/10 my-0.5" />
          <button onClick={() => setCardMenu(null)}
            className="text-left text-xs text-slate-500 px-4 py-1.5 rounded-lg hover:bg-white/5 hover:text-slate-300 transition-colors">
            ✕ Cancelar
          </button>
        </div>
      )}

      {tooltip && !cardMenu && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
