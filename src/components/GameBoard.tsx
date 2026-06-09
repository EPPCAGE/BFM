import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameLog } from './GameLog';
import { PlayZone } from './PlayZone';
import { EnergyPool } from './EnergyPool';
import { CardImage } from './CardImage';
import { CardTooltip } from './CardTooltip';
import { canAttack } from '../game/engine';
import { useTooltip } from '../hooks/useTooltip';
import type { PokemonCardDef } from '../game/types';

type PendingTrainer = { cardId: string; targetType: 'friendly' | 'enemy' } | null;

// Trainers that need a friendly target
const FRIENDLY_TARGET_TRAINERS = new Set(['potion', 'super-potion', 'switch']);
// Trainers that need an enemy target
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

  // Tooltip for player hand cards
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
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-yellow-400">LORKEMON</h1>
          <span className="text-sm text-slate-400">Turno {turn}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${isPlayerTurn ? 'bg-blue-700 text-white' : 'bg-red-700 text-white'}`}>
            {aiThinking ? '⏳ IA pensando...' : isPlayerTurn ? '🟦 Sua vez' : '🟥 Vez da IA'}
          </span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-300">Você: <strong>{playerState.points}</strong>/10</span>
          <span className="text-red-300">IA: <strong>{aiState.points}</strong>/10</span>
        </div>
        <div className="flex gap-2">
          {cancelMode && (
            <button
              onClick={() => { setAttackMode(null); setPendingTrainer(null); setPendingTeleport(null); }}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
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
        <div className="bg-orange-700 text-white text-sm text-center py-1 flex-shrink-0">
          ⚔️ Selecione um Pokémon vulnerável do oponente para atacar
        </div>
      )}
      {pendingTeleport && (
        <div className="bg-indigo-700 text-white text-sm text-center py-1 flex-shrink-0">
          🌀 Teletransporte: clique em um Pokémon Básico da sua mão para trocar
        </div>
      )}
      {pendingTrainer?.targetType === 'friendly' && (
        <div className="bg-green-700 text-white text-sm text-center py-1 flex-shrink-0">
          💊 Selecione um de seus Pokémon como alvo
        </div>
      )}
      {pendingTrainer?.targetType === 'enemy' && (
        <div className="bg-purple-700 text-white text-sm text-center py-1 flex-shrink-0">
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
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR: energy pools ── */}
        <div className="w-20 flex-shrink-0 flex flex-col bg-slate-800/40 border-r border-slate-700/50">
          {/* AI energy (top half) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1 border-b border-slate-700/50">
            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wide">IA ⚡</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 160 }}>
              {aiState.energyPool.map((e) => (
                <div
                  key={e.instanceId}
                  className={`rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
                  style={{ width: 28, height: 39 }}
                  title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
                >
                  <CardBack size={28} />
                </div>
              ))}
              {aiState.energyPool.length === 0 && (
                <span className="text-slate-600 text-[9px]">–</span>
              )}
            </div>
            <span className="text-[9px] text-yellow-400">
              {aiState.energyPool.filter(e => !e.used).length}/{aiState.energyPool.length}
            </span>
          </div>
          {/* Player energy (bottom half) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1">
            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">⚡ Você</span>
            <div className="flex flex-col gap-0.5 items-center overflow-y-auto scrollbar-hide" style={{ maxHeight: 160 }}>
              {playerState.energyPool.map((e) => (
                <div
                  key={e.instanceId}
                  className={`rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
                  style={{ width: 28, height: 39 }}
                  title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
                >
                  <CardBack size={28} />
                </div>
              ))}
              {playerState.energyPool.length === 0 && (
                <span className="text-slate-600 text-[9px]">–</span>
              )}
            </div>
            <span className="text-[9px] text-yellow-400">
              {playerState.energyPool.filter(e => !e.used).length}/{playerState.energyPool.length}
            </span>
          </div>
        </div>

        {/* ── CENTER: opponent hand / field / divider / player field / player hand ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Opponent hand strip (face-down) */}
          <div className="flex-shrink-0 flex items-center justify-center gap-1 py-2 px-4 bg-red-950/20 border-b border-red-900/20">
            <span className="text-[10px] text-red-400 mr-2 font-semibold">IA ({aiState.hand.length})</span>
            <div className="flex gap-[-8px] overflow-x-auto scrollbar-hide">
              {aiState.hand.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0"
                  style={{ marginLeft: idx === 0 ? 0 : -8 }}
                >
                  <CardBack size={42} />
                </div>
              ))}
              {aiState.hand.length === 0 && (
                <span className="text-slate-600 text-xs italic">Mão vazia</span>
              )}
            </div>
            <div className="ml-auto flex gap-3 text-[10px] text-slate-400">
              <span>🃏 {aiState.deckCards.length}</span>
              <span>🗑️ {aiState.discardPile.length}</span>
            </div>
          </div>

          {/* AI play zone */}
          <div className={`flex-1 flex items-center justify-center p-3 ${
            currentPlayer === 'ai' ? 'bg-red-950/20' : 'bg-slate-900/30'
          }`}>
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-red-400 font-bold">IA — Em Jogo ({aiState.playArea.length}/5)</span>
                {(attackMode) && (
                  <span className="text-xs text-orange-400 animate-pulse">← Selecione o alvo</span>
                )}
                {pendingTrainer?.targetType === 'enemy' && (
                  <span className="text-xs text-orange-400 animate-pulse">← Selecione o alvo</span>
                )}
              </div>
              <PlayZone
                playerState={aiState}
                isCurrentPlayer={currentPlayer === 'ai'}
                isOpponent={true}
                attackMode={attackMode}
                onSelectAttackTarget={handleSelectAttackTarget}
                pendingTrainer={pendingTrainer}
                onSelectTrainerTarget={handleSelectTrainerTarget}
              />
            </div>
          </div>

          {/* Divider / field center line */}
          <div className="flex-shrink-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent mx-8" />
          <div className="flex-shrink-0 flex items-center justify-center py-1">
            <div className="h-0.5 w-16 bg-slate-600 rounded-full" />
          </div>

          {/* Player play zone */}
          <div className={`flex-1 flex items-center justify-center p-3 ${
            isPlayerTurn ? 'bg-blue-950/20' : 'bg-slate-900/30'
          }`}>
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-blue-400 font-bold">Você — Em Jogo ({playerState.playArea.length}/5)</span>
                {pendingTrainer?.targetType === 'friendly' && (
                  <span className="text-xs text-green-400 animate-pulse">← Selecione o alvo</span>
                )}
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
              />
            </div>
          </div>

          {/* Player hand strip (full width) */}
          <div className="flex-shrink-0 bg-blue-950/30 border-t border-blue-900/30 p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-300 font-semibold">Mão ({playerState.hand.length})</span>
              {isPlayerTurn && !playerState.energyPlayedThisTurn && (
                <span className="text-[10px] text-yellow-500/70">⚡ Passe o mouse → clique ⚡ para usar como energia</span>
              )}
              {!isPlayerTurn && (
                <span className="text-[10px] text-slate-500 italic">Aguardando turno da IA…</span>
              )}
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 justify-center">
              {playerState.hand.map((card, idx) => {
                const isTeleportTarget = pendingTeleport && card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic';
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className={`relative card-in-hand rounded-lg cursor-pointer flex-shrink-0 group ${isTeleportTarget ? 'ring-2 ring-indigo-400 animate-pulse' : ''}`}
                    style={{ width: 90, height: 126 }}
                    onClick={() => handleHandClick(idx)}
                    onMouseEnter={(e) => showTooltip(card, e)}
                    onMouseMove={moveTooltip}
                    onMouseLeave={hideTooltip}
                  >
                    <CardImage card={card} className="w-full h-full" />
                    {card.type === 'item' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-700/80 text-[8px] text-center text-white rounded-b">ITEM</div>
                    )}
                    {card.type === 'supporter' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-700/80 text-[8px] text-center text-white rounded-b">APOIADOR</div>
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
                <span className="text-slate-500 text-xs italic py-8">Mão vazia</span>
              )}
            </div>
          </div>

        </div>{/* end center */}

        {/* ── RIGHT SIDEBAR: deck/discard/log ── */}
        <div className="w-52 flex-shrink-0 flex flex-col bg-slate-800/40 border-l border-slate-700/50 overflow-hidden">

          {/* AI deck + discard */}
          <div className="p-2 border-b border-slate-700/50 flex-shrink-0">
            <div className="text-[10px] text-red-400 font-bold mb-1.5 uppercase tracking-wide">IA — Deck & Descarte</div>
            <div className="flex gap-2 items-center">
              <div className="flex flex-col items-center gap-0.5">
                <CardBack size={36} />
                <span className="text-[9px] text-slate-400">{aiState.deckCards.length} cartas</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                {aiState.discardPile.length > 0 ? (
                  <div className="rounded border border-slate-600" style={{ width: 36 }}>
                    <CardImage card={aiState.discardPile[aiState.discardPile.length - 1]} className="w-full" style={{ height: 50 }} />
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-slate-600 flex items-center justify-center" style={{ width: 36, height: 50 }}>
                    <span className="text-slate-600 text-[8px]">–</span>
                  </div>
                )}
                <span className="text-[9px] text-slate-400">{aiState.discardPile.length} desc.</span>
              </div>
            </div>
          </div>

          {/* Game Log — fills remaining space */}
          <div className="flex-1 overflow-hidden">
            <GameLog entries={gameState.log} />
          </div>

          {/* Player deck + discard */}
          <div className="p-2 border-t border-slate-700/50 flex-shrink-0">
            <div className="text-[10px] text-blue-400 font-bold mb-1.5 uppercase tracking-wide">Você — Deck & Descarte</div>
            <div className="flex gap-2 items-center">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => isPlayerTurn && !playerState.energyPlayedThisTurn && handleEnergyPlay('deck')}
                  title={isPlayerTurn && !playerState.energyPlayedThisTurn ? 'Comprar energia do deck' : 'Deck'}
                >
                  <CardBack size={36} />
                </div>
                <span className="text-[9px] text-slate-400">{playerState.deckCards.length} cartas</span>
                {isPlayerTurn && !playerState.energyPlayedThisTurn && (
                  <span className="text-[8px] text-yellow-500">⚡ deck</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                {playerState.discardPile.length > 0 ? (
                  <div
                    className={`rounded border ${isPlayerTurn && !playerState.energyPlayedThisTurn ? 'border-yellow-400 cursor-pointer hover:opacity-80' : 'border-slate-600'}`}
                    style={{ width: 36 }}
                    onClick={() => isPlayerTurn && !playerState.energyPlayedThisTurn && handleEnergyPlay('discard')}
                    title={isPlayerTurn && !playerState.energyPlayedThisTurn ? 'Usar energia do descarte' : 'Descarte'}
                  >
                    <CardImage card={playerState.discardPile[playerState.discardPile.length - 1]} className="w-full" style={{ height: 50 }} />
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-slate-600 flex items-center justify-center" style={{ width: 36, height: 50 }}>
                    <span className="text-slate-600 text-[8px]">–</span>
                  </div>
                )}
                <span className="text-[9px] text-slate-400">{playerState.discardPile.length} desc.</span>
                {isPlayerTurn && !playerState.energyPlayedThisTurn && playerState.discardPile.length > 0 && (
                  <span className="text-[8px] text-yellow-500">⚡ desc.</span>
                )}
              </div>
            </div>
          </div>

        </div>{/* end right sidebar */}
      </div>{/* end main area */}

      {tooltip && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
