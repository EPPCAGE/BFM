import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerBoard } from './PlayerBoard';
import { GameLog } from './GameLog';
import { DeckSearchModal } from './DeckSearchModal';
import { HintPanel } from './HintPanel';
import { canAttack } from '../game/engine';
import { playSound } from '../utils/sounds';

type PendingTrainer = { cardId: string; targetType: 'friendly' | 'enemy' } | null;

export function GameBoard() {
  const {
    gameState, endTurnAction,
    playEnergyFromHandAction, playEnergyFromDeckAction, playEnergyFromDiscardAction,
    summonAction, attackAction, abilityAttackAction, evolveAction, playTrainerAction,
    completeDeckSearchAction, resetGame,
  } = useGameStore();

  const [attackMode, setAttackMode] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);
  const [pendingTrainer, setPendingTrainer] = useState<PendingTrainer>(null);
  const [pendingTeleport, setPendingTeleport] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);

  const prevResultRef = useRef<string | null>(null);
  const prevLogLenRef = useRef(0);
  useEffect(() => {
    if (!gameState) return;
    if (gameState.result && gameState.result !== prevResultRef.current) {
      prevResultRef.current = gameState.result;
      playSound(gameState.result === 'player_wins' ? 'win' : 'ko');
    }
    const newEntries = gameState.log.slice(prevLogLenRef.current);
    prevLogLenRef.current = gameState.log.length;
    for (const e of newEntries) {
      const m = e.message;
      if (m.includes('derrotado')) playSound('ko');
      else if (m.includes('usou') && m.includes('dano')) playSound('attack');
      else if (m.includes('invocou')) playSound('summon');
      else if (m.includes('evoluiu') || m.includes('Evo')) playSound('evolve');
    }
  });

  if (!gameState) return null;

  const { players, turn, currentPlayer, result, aiThinking } = gameState;
  const isPlayerTurn = currentPlayer === 'player';

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
    if (!attackMode) return;
    attackAction(attackMode.attackerInstanceId, attackMode.attackIndex, targetInstanceId);
    setAttackMode(null);
  }

  function handleTrainerPlay(cardId: string, signal?: string) {
    if (signal === '__SELECT_FRIENDLY__') setPendingTrainer({ cardId, targetType: 'friendly' });
    else if (signal === '__SELECT_ENEMY__') setPendingTrainer({ cardId, targetType: 'enemy' });
    else playTrainerAction(cardId, signal);
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

  function handleEnergyPlay(source: 'hand' | 'deck' | 'discard', index?: number) {
    if (source === 'hand' && index !== undefined) playEnergyFromHandAction(index);
    else if (source === 'deck') playEnergyFromDeckAction();
    else if (source === 'discard') playEnergyFromDiscardAction();
  }

  const cancelMode = attackMode || pendingTrainer || pendingTeleport;

  // Context banner config
  const banner = attackMode
    ? { bg: 'from-orange-900 to-orange-800', border: 'border-orange-500/50', text: '⚔️  Selecione um Pokémon VULNERÁVEL do oponente para atacar' }
    : pendingTeleport
    ? { bg: 'from-indigo-900 to-indigo-800', border: 'border-indigo-400/50', text: '🌀  Teletransporte: clique em um Pokémon Básico da sua mão' }
    : pendingTrainer?.targetType === 'friendly'
    ? { bg: 'from-green-900 to-green-800', border: 'border-green-400/50', text: '💊  Selecione um de seus Pokémon como alvo' }
    : pendingTrainer?.targetType === 'enemy'
    ? { bg: 'from-purple-900 to-purple-800', border: 'border-purple-400/50', text: '🎯  Ordens do Chefe: selecione um Pokémon PRONTO do oponente' }
    : gameState.pendingFreeSummon
    ? { bg: 'from-teal-900 to-teal-800', border: 'border-teal-400/50', text: '🔄  Switch: clique em um Pokémon Básico da sua mão para invocar' }
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden tcg-mat">

      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-5 py-2 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg,rgba(2,6,23,0.97) 0%,rgba(10,18,40,0.95) 100%)',
          borderBottom: '1px solid rgba(251,191,36,0.25)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.7), 0 1px 0 rgba(251,191,36,0.1)',
        }}
      >
        {/* Logo + turn */}
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-black tracking-widest"
            style={{
              background: 'linear-gradient(135deg,#fde047 0%,#f59e0b 50%,#fde047 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))',
            }}
          >
            LORKEMON
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">TURNO</span>
            <span className="text-white font-bold text-sm">{turn}</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold"
            style={isPlayerTurn
              ? { background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow: '0 0 12px rgba(37,99,235,0.5)', color: '#fff' }
              : { background: 'linear-gradient(135deg,#991b1b,#dc2626)', boxShadow: '0 0 12px rgba(220,38,38,0.5)', color: '#fff' }
            }
          >
            {aiThinking ? '⏳ IA pensando…' : isPlayerTurn ? '● Sua vez' : '● Vez da IA'}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
            <span className="text-slate-400 text-xs">Você</span>
            <span className="text-white font-black text-lg leading-none">{players.player.points}</span>
            <span className="text-slate-600 text-xs">/10</span>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
            <span className="text-slate-400 text-xs">IA</span>
            <span className="text-white font-black text-lg leading-none">{players.ai.points}</span>
            <span className="text-slate-600 text-xs">/10</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {cancelMode && (
            <button
              onClick={() => { setAttackMode(null); setPendingTrainer(null); setPendingTeleport(null); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 transition-all hover:text-white"
              style={{ background: 'rgba(71,85,105,0.6)', border: '1px solid rgba(100,116,139,0.4)' }}
            >
              ✕ Cancelar
            </button>
          )}
          {isPlayerTurn && !cancelMode && !aiThinking && gameState.phase !== 'end' && (
            <button
              onClick={endTurnAction}
              className="px-5 py-1.5 text-sm font-black rounded-lg text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg,#15803d,#16a34a)',
                boxShadow: '0 0 16px rgba(22,163,74,0.5), 0 2px 8px rgba(0,0,0,0.4)',
                border: '1px solid rgba(74,222,128,0.3)',
              }}
            >
              Encerrar Turno →
            </button>
          )}
          <button
            onClick={resetGame}
            className="px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.4)' }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* ── Context Banner ── */}
      {banner && (
        <div
          className={`flex items-center justify-center gap-2 py-1.5 text-sm font-semibold text-white flex-shrink-0 bg-gradient-to-r ${banner.bg} border-b ${banner.border}`}
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          {banner.text}
        </div>
      )}

      {/* ── Result Overlay ── */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
          <div
            className="result-pop text-center px-16 py-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))',
              border: result === 'player_wins' ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(239,68,68,0.5)',
              boxShadow: result === 'player_wins'
                ? '0 0 60px rgba(251,191,36,0.3), 0 24px 64px rgba(0,0,0,0.8)'
                : '0 0 60px rgba(239,68,68,0.3), 0 24px 64px rgba(0,0,0,0.8)',
            }}
          >
            <div className="text-7xl mb-4">{result === 'player_wins' ? '🏆' : '💀'}</div>
            <h2 className="text-4xl font-black mb-2 text-white">
              {result === 'player_wins' ? 'Você Venceu!' : 'IA Venceu!'}
            </h2>
            <p className="text-slate-400 mb-8 text-sm">
              Turno {turn} · Você: <strong className="text-blue-300">{players.player.points}</strong> pts · IA: <strong className="text-red-300">{players.ai.points}</strong> pts
            </p>
            <button
              onClick={resetGame}
              className="px-10 py-3 font-black text-lg rounded-2xl text-black transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                boxShadow: '0 0 24px rgba(251,191,36,0.6)',
              }}
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {/* ── Deck Search Modal ── */}
      {gameState.pendingDeckSearch && (
        <DeckSearchModal search={gameState.pendingDeckSearch} onSelect={completeDeckSearchAction} />
      )}

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {/* Boards */}
        <div className="flex flex-col flex-1 gap-0 overflow-y-auto scrollbar-hide rounded-xl overflow-hidden">
          <PlayerBoard
            playerState={players.ai}
            isCurrentPlayer={currentPlayer === 'ai'}
            isOpponent={true}
            attackMode={attackMode}
            onSelectAttackTarget={handleSelectAttackTarget}
            pendingTrainer={pendingTrainer}
            onSelectTrainerTarget={handleSelectTrainerTarget}
          />

          {/* Divider */}
          <div className="board-divider" />

          <PlayerBoard
            playerState={players.player}
            isCurrentPlayer={isPlayerTurn}
            isOpponent={false}
            onPlayEnergy={handleEnergyPlay}
            onSummon={summonAction}
            onAttack={handleAttack}
            onEvolve={evolveAction}
            onPlayTrainer={handleTrainerPlay}
            attackMode={attackMode}
            pendingTrainer={pendingTrainer}
            onSelectTrainerTarget={handleSelectTrainerTarget}
            pendingTeleport={!!pendingTeleport}
            onSelectTeleportHandCard={handleSelectTeleportTarget}
          />
        </div>

        {/* Right panel */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-hidden">
          <HintPanel gameState={gameState} />
          <GameLog entries={gameState.log} />
        </div>
      </div>
    </div>
  );
}
