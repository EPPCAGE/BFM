import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameLog } from './GameLog';
import { PlayZone } from './PlayZone';
import { CardImage } from './CardImage';
import { CardTooltip } from './CardTooltip';
import { canAttack } from '../game/engine';
import { useTooltip } from '../hooks/useTooltip';
import type { PokemonCardDef } from '../game/types';

type PendingTrainer = { cardId: string; targetType: 'friendly' | 'enemy' } | null;

const FRIENDLY_TARGET_TRAINERS = new Set(['potion', 'super-potion', 'switch']);
const ENEMY_TARGET_TRAINERS = new Set(['bosss-orders']);

/** Small face-down card backs for opponent hand */
function CardBack({ size = 60 }: { size?: number }) {
  const h = Math.round(size * (88 / 63));
  return (
    <svg viewBox="0 0 63 88" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: h }}>
      <rect width="63" height="88" rx="4" fill="#1a56a0" />
      <rect x="3" y="3" width="57" height="82" rx="3" fill="#1e63bc" />
      <rect x="5" y="5" width="53" height="78" rx="2" fill="#1a56a0" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="31.5" cy="44" r="18" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="31.5" cy="44" r="10" fill="#fbbf24" />
      <circle cx="31.5" cy="44" r="5" fill="#1a56a0" />
      <line x1="13.5" y1="44" x2="49.5" y2="44" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="31.5" y="18" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="bold" fontFamily="sans-serif">POKÉMON</text>
    </svg>
  );
}

export function GameBoard() {
  const {
    gameState, endTurnAction,
    playEnergyFromHandAction, playEnergyFromDeckAction, playEnergyFromDiscardAction,
    summonAction, attackAction, abilityAttackAction, evolveAction, playTrainerAction, resetGame,
  } = useGameStore();

  const [attackMode, setAttackMode] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);
  const [pendingTrainer, setPendingTrainer] = useState<PendingTrainer>(null);
  const [pendingTeleport, setPendingTeleport] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);
  const [logOpen, setLogOpen] = useState(true);

  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  if (!gameState) return null;

  const { players, turn, currentPlayer, result, aiThinking } = gameState;
  const isPlayerTurn = currentPlayer === 'player';
  const playerState = players.player;
  const aiState = players.ai;

  function handleAttack(attackerInstanceId: string, attackIndex: number) {
    if (!gameState) return;
    const attacker = gameState.players.player.playArea.find(pk => pk.instanceId === attackerInstanceId);
    const attack = attacker?.def.attacks[attackIndex];
    if (attack && attack.damage === 0 && attack.effectType) {
      if (attack.effectType === 'teleport') {
        setPendingTeleport({ attackerInstanceId, attackIndex });
      } else {
        abilityAttackAction(attackerInstanceId, attackIndex);
      }
      return;
    }
    if (!canAttack(gameState, 'player', attackerInstanceId, attackIndex)) return;
    setAttackMode({ attackerInstanceId, attackIndex });
  }

  function handleSelectAttackTarget(targetInstanceId: string) {
    if (!attackMode) return;
    attackAction(attackMode.attackerInstanceId, attackMode.attackIndex, targetInstanceId);
    setAttackMode(null);
  }

  function handleTrainerPlay(cardId: string, signal?: string) {
    if (signal === '__SELECT_FRIENDLY__') {
      setPendingTrainer({ cardId, targetType: 'friendly' });
    } else if (signal === '__SELECT_ENEMY__') {
      setPendingTrainer({ cardId, targetType: 'enemy' });
    } else {
      playTrainerAction(cardId, signal);
    }
  }

  function handleSelectTrainerTarget(targetInstanceId: string) {
    if (!pendingTrainer) return;
    playTrainerAction(pendingTrainer.cardId, targetInstanceId);
    setPendingTrainer(null);
  }

  function handleSelectTeleportTarget(handIndex: number) {
    if (!pendingTeleport) return;
    abilityAttackAction(pendingTeleport.attackerInstanceId, pendingTeleport.attackIndex, handIndex);
    setPendingTeleport(null);
  }

  function handleHandClick(idx: number) {
    if (!isPlayerTurn) return;
    const card = playerState.hand[idx];
    if (!card) return;

    if (pendingTeleport) {
      if (card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic') {
        handleSelectTeleportTarget(idx);
      }
      return;
    }

    if (card.type === 'pokemon') {
      const def = card as PokemonCardDef;
      if (def.stage === 'Basic') summonAction(card.id);
    } else if (card.type === 'item' || card.type === 'supporter') {
      if (FRIENDLY_TARGET_TRAINERS.has(card.id)) {
        handleTrainerPlay(card.id, '__SELECT_FRIENDLY__');
      } else if (ENEMY_TARGET_TRAINERS.has(card.id)) {
        handleTrainerPlay(card.id, '__SELECT_ENEMY__');
      } else {
        handleTrainerPlay(card.id);
      }
    }
  }

  function handleEnergyPlay(source: 'hand' | 'deck' | 'discard', index?: number) {
    if (source === 'hand' && index !== undefined) playEnergyFromHandAction(index);
    else if (source === 'deck') playEnergyFromDeckAction();
    else if (source === 'discard') playEnergyFromDiscardAction();
  }

  const cancelMode = attackMode || pendingTrainer || pendingTeleport;

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-yellow-400 tracking-wide">LORKEMON TCG</h1>
          <span className="text-xs text-slate-400">Turno {turn}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${isPlayerTurn ? 'bg-blue-700 text-white' : 'bg-red-700 text-white'}`}>
            {aiThinking ? '⏳ IA pensando...' : isPlayerTurn ? '🟦 Sua vez' : '🟥 Vez da IA'}
          </span>
          {/* Score badges */}
          <span className="text-xs bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded">Você: <strong className="text-white">{playerState.points}</strong>/10</span>
          <span className="text-xs bg-red-900/60 text-red-200 px-2 py-0.5 rounded">IA: <strong className="text-white">{aiState.points}</strong>/10</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setLogOpen(o => !o)}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded"
            title="Mostrar/ocultar log"
          >
            {logOpen ? '📋 Log' : '📋'}
          </button>
          {cancelMode && (
            <button
              onClick={() => { setAttackMode(null); setPendingTrainer(null); setPendingTeleport(null); }}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded font-semibold"
            >
              ✕ Cancelar
            </button>
          )}
          {isPlayerTurn && !cancelMode && !aiThinking && gameState.phase !== 'end' && (
            <button
              onClick={endTurnAction}
              className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded"
            >
              Encerrar Turno →
            </button>
          )}
          <button onClick={resetGame} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded">
            Sair
          </button>
        </div>
      </div>

      {/* ── CONTEXT BANNER ── */}
      {attackMode && (
        <div className="bg-orange-700 text-white text-sm text-center py-1 flex-shrink-0 font-semibold">
          ⚔️ Selecione um Pokémon vulnerável do oponente para atacar
        </div>
      )}
      {pendingTeleport && (
        <div className="bg-indigo-700 text-white text-sm text-center py-1 flex-shrink-0 font-semibold">
          🌀 Teletransporte: clique em um Pokémon Básico da sua mão para trocar
        </div>
      )}
      {pendingTrainer?.targetType === 'friendly' && (
        <div className="bg-green-700 text-white text-sm text-center py-1 flex-shrink-0 font-semibold">
          💊 Selecione um de seus Pokémon como alvo
        </div>
      )}
      {pendingTrainer?.targetType === 'enemy' && (
        <div className="bg-purple-700 text-white text-sm text-center py-1 flex-shrink-0 font-semibold">
          🎯 Selecione um Pokémon do oponente como alvo
        </div>
      )}

      {/* ── RESULT OVERLAY ── */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-10 text-center shadow-2xl">
            <div className="text-5xl mb-4">{result === 'player_wins' ? '🏆' : '💀'}</div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              {result === 'player_wins' ? 'Você Venceu!' : 'IA Venceu!'}
            </h2>
            <p className="text-slate-400 mb-6">
              Turno {turn} · Placar — Você: {playerState.points} | IA: {aiState.points}
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-lg"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── LEFT SIDEBAR: energy pools ── */}
        <div className="w-16 flex-shrink-0 flex flex-col bg-slate-800/50 border-r border-slate-700/50">
          {/* AI energy (top half) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1 border-b border-slate-700/40">
            <span className="text-[8px] text-red-400 font-bold uppercase tracking-wider">IA ⚡</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 140 }}>
              {aiState.energyPool.map((e) => (
                <div
                  key={e.instanceId}
                  className={`rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
                  style={{ width: 24, height: 34 }}
                  title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
                >
                  <CardBack size={24} />
                </div>
              ))}
              {aiState.energyPool.length === 0 && (
                <span className="text-slate-600 text-[8px]">–</span>
              )}
            </div>
            <span className="text-[8px] text-yellow-400 font-bold">
              {aiState.energyPool.filter(e => !e.used).length}/{aiState.energyPool.length}
            </span>
          </div>
          {/* Player energy (bottom half) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1">
            <span className="text-[8px] text-blue-400 font-bold uppercase tracking-wider">⚡ Você</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 140 }}>
              {playerState.energyPool.map((e) => (
                <div
                  key={e.instanceId}
                  className={`rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
                  style={{ width: 24, height: 34 }}
                  title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
                >
                  <CardBack size={24} />
                </div>
              ))}
              {playerState.energyPool.length === 0 && (
                <span className="text-slate-600 text-[8px]">–</span>
              )}
            </div>
            <span className="text-[8px] text-yellow-400 font-bold">
              {playerState.energyPool.filter(e => !e.used).length}/{playerState.energyPool.length}
            </span>
          </div>
        </div>

        {/* ── CENTER: full play field ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── OPPONENT HAND STRIP (top, face-down, full width) ── */}
          <div className="flex-shrink-0 bg-red-950/30 border-b border-red-900/30 flex items-center px-3 py-1.5 gap-2"
            style={{ minHeight: 72 }}>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex-shrink-0">
              IA ({aiState.hand.length})
            </span>
            <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide">
              <div className="flex items-center">
                {aiState.hand.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 transition-transform hover:translate-y-1"
                    style={{ marginLeft: idx === 0 ? 0 : -18 }}
                  >
                    <CardBack size={46} />
                  </div>
                ))}
                {aiState.hand.length === 0 && (
                  <span className="text-slate-600 text-xs italic">Mão vazia</span>
                )}
              </div>
            </div>
          </div>

          {/* ── OPPONENT PLAY ZONE ── */}
          <div
            className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${
              currentPlayer === 'ai' ? 'bg-red-950/25' : 'bg-slate-900/20'
            }`}
            style={{ minHeight: 0 }}
          >
            {/* Zone label */}
            <div className="absolute top-1 left-3 flex items-center gap-2 z-10">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                IA — Em Jogo ({aiState.playArea.length}/5)
              </span>
              {(attackMode || pendingTrainer?.targetType === 'enemy') && (
                <span className="text-[10px] text-orange-400 animate-pulse font-bold">⟵ Selecione o alvo</span>
              )}
            </div>
            {/* Deck/Discard overlay — top right corner */}
            <div className="absolute top-1 right-2 flex gap-2 items-center z-10">
              <div className="flex flex-col items-center gap-0.5">
                <CardBack size={28} />
                <span className="text-[8px] text-slate-500">{aiState.deckCards.length}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                {aiState.discardPile.length > 0 ? (
                  <div className="rounded border border-slate-600 overflow-hidden" style={{ width: 28 }}>
                    <CardImage card={aiState.discardPile[aiState.discardPile.length - 1]} className="w-full" style={{ height: 39 }} />
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-slate-700 flex items-center justify-center" style={{ width: 28, height: 39 }}>
                    <span className="text-slate-700 text-[7px]">–</span>
                  </div>
                )}
                <span className="text-[8px] text-slate-500">{aiState.discardPile.length}</span>
              </div>
            </div>

            <PlayZone
              playerState={aiState}
              isCurrentPlayer={currentPlayer === 'ai'}
              isOpponent={true}
              attackMode={attackMode}
              onSelectAttackTarget={handleSelectAttackTarget}
              pendingTrainer={pendingTrainer}
              onSelectTrainerTarget={handleSelectTrainerTarget}
              cardSize="large"
            />
          </div>

          {/* ── CENTER DIVIDER ── */}
          <div className="flex-shrink-0 relative flex items-center justify-center py-0.5">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-500/60 to-transparent" />
            <div className="relative bg-slate-900 px-3 py-0.5 rounded-full border border-slate-700/60">
              <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase">Campo de Batalha</span>
            </div>
          </div>

          {/* ── PLAYER PLAY ZONE ── */}
          <div
            className={`flex-1 flex flex-col items-center justify-center relative transition-colors ${
              isPlayerTurn ? 'bg-blue-950/25' : 'bg-slate-900/20'
            }`}
            style={{ minHeight: 0 }}
          >
            {/* Zone label */}
            <div className="absolute top-1 left-3 flex items-center gap-2 z-10">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Você — Em Jogo ({playerState.playArea.length}/5)
              </span>
              {pendingTrainer?.targetType === 'friendly' && (
                <span className="text-[10px] text-green-400 animate-pulse font-bold">⟵ Selecione o alvo</span>
              )}
            </div>
            {/* Deck/Discard overlay — bottom right corner */}
            <div className="absolute bottom-1 right-2 flex gap-2 items-center z-10">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`rounded overflow-hidden ${isPlayerTurn && !playerState.energyPlayedThisTurn ? 'cursor-pointer hover:opacity-80 ring-1 ring-yellow-500' : ''}`}
                  onClick={() => isPlayerTurn && !playerState.energyPlayedThisTurn && handleEnergyPlay('deck')}
                  title={isPlayerTurn && !playerState.energyPlayedThisTurn ? 'Comprar energia do deck' : 'Deck'}
                >
                  <CardBack size={28} />
                </div>
                <span className="text-[8px] text-slate-500">{playerState.deckCards.length}</span>
                {isPlayerTurn && !playerState.energyPlayedThisTurn && (
                  <span className="text-[7px] text-yellow-500">⚡deck</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                {playerState.discardPile.length > 0 ? (
                  <div
                    className={`rounded overflow-hidden border ${isPlayerTurn && !playerState.energyPlayedThisTurn ? 'border-yellow-400 cursor-pointer hover:opacity-80' : 'border-slate-600'}`}
                    style={{ width: 28 }}
                    onClick={() => isPlayerTurn && !playerState.energyPlayedThisTurn && handleEnergyPlay('discard')}
                    title={isPlayerTurn && !playerState.energyPlayedThisTurn ? 'Usar energia do descarte' : 'Descarte'}
                  >
                    <CardImage card={playerState.discardPile[playerState.discardPile.length - 1]} className="w-full" style={{ height: 39 }} />
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-slate-700 flex items-center justify-center" style={{ width: 28, height: 39 }}>
                    <span className="text-slate-700 text-[7px]">–</span>
                  </div>
                )}
                <span className="text-[8px] text-slate-500">{playerState.discardPile.length}</span>
                {isPlayerTurn && !playerState.energyPlayedThisTurn && playerState.discardPile.length > 0 && (
                  <span className="text-[7px] text-yellow-500">⚡desc</span>
                )}
              </div>
            </div>

            <PlayZone
              playerState={playerState}
              isCurrentPlayer={isPlayerTurn}
              isOpponent={false}
              onAttack={handleAttack}
              onEvolve={evolveAction}
              attackMode={attackMode}
              pendingTrainer={pendingTrainer}
              onSelectTrainerTarget={handleSelectTrainerTarget}
              cardSize="large"
            />
          </div>

          {/* ── PLAYER HAND STRIP (bottom, full width, fan-style) ── */}
          <div className="flex-shrink-0 bg-blue-950/35 border-t border-blue-900/30" style={{ minHeight: 156 }}>
            <div className="flex items-center gap-3 px-3 pt-1.5 pb-0.5">
              <span className="text-xs text-blue-300 font-bold">Mão ({playerState.hand.length})</span>
              {isPlayerTurn && !playerState.energyPlayedThisTurn && (
                <span className="text-[10px] text-yellow-500/80">⚡ Passe o mouse → clique ⚡ para usar como energia</span>
              )}
              {!isPlayerTurn && (
                <span className="text-[10px] text-slate-500 italic">Aguardando turno da IA…</span>
              )}
            </div>
            <div className="flex items-end justify-center gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
              {playerState.hand.map((card, idx) => {
                const isTeleportTarget = pendingTeleport && card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic';
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className={`relative card-in-hand rounded-lg cursor-pointer flex-shrink-0 group shadow-lg ${isTeleportTarget ? 'ring-2 ring-indigo-400 animate-pulse' : ''}`}
                    style={{ width: 100, height: 140 }}
                    onClick={() => handleHandClick(idx)}
                    onMouseEnter={(e) => showTooltip(card, e)}
                    onMouseMove={moveTooltip}
                    onMouseLeave={hideTooltip}
                  >
                    <CardImage card={card} className="w-full h-full rounded-lg" />
                    {card.type === 'item' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-700/90 text-[8px] text-center text-white rounded-b font-semibold">ITEM</div>
                    )}
                    {card.type === 'supporter' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-700/90 text-[8px] text-center text-white rounded-b font-semibold">APOIADOR</div>
                    )}
                    {isPlayerTurn && !playerState.energyPlayedThisTurn && (
                      <button
                        className="absolute top-1 right-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => { e.stopPropagation(); handleEnergyPlay('hand', idx); }}
                        title="Usar como energia"
                      >
                        ⚡
                      </button>
                    )}
                  </div>
                );
              })}
              {playerState.hand.length === 0 && (
                <span className="text-slate-500 text-sm italic py-10">Mão vazia</span>
              )}
            </div>
          </div>

        </div>{/* end center */}

        {/* ── RIGHT SIDEBAR: log (collapsible) ── */}
        {logOpen && (
          <div className="w-48 flex-shrink-0 flex flex-col bg-slate-800/40 border-l border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700/50 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log</span>
              <button
                onClick={() => setLogOpen(false)}
                className="text-slate-600 hover:text-slate-400 text-xs leading-none"
              >✕</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <GameLog entries={gameState.log} />
            </div>
          </div>
        )}

      </div>{/* end main area */}

      {tooltip && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
