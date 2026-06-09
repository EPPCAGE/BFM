import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerBoard } from './PlayerBoard';
import { GameLog } from './GameLog';
import { canAttack } from '../game/engine';

export function GameBoard() {
  const {
    gameState, endTurnAction,
    playEnergyFromHandAction, playEnergyFromDeckAction, playEnergyFromDiscardAction,
    summonAction, attackAction, playTrainerAction, resetGame,
  } = useGameStore();

  const [attackMode, setAttackMode] = useState<{ attackerInstanceId: string; attackIndex: number } | null>(null);

  if (!gameState) return null;

  const { players, turn, currentPlayer, result, aiThinking } = gameState;
  const isPlayerTurn = currentPlayer === 'player';

  function handleAttack(attackerInstanceId: string, attackIndex: number) {
    if (!gameState) return;
    if (!canAttack(gameState, 'player', attackerInstanceId, attackIndex)) return;
    setAttackMode({ attackerInstanceId, attackIndex });
  }

  function handleSelectTarget(targetInstanceId: string) {
    if (!attackMode || !gameState) return;
    attackAction(attackMode.attackerInstanceId, attackMode.attackIndex, targetInstanceId);
    setAttackMode(null);
  }

  function handleEnergyPlay(source: 'hand' | 'deck' | 'discard', index?: number) {
    if (source === 'hand' && index !== undefined) playEnergyFromHandAction(index);
    else if (source === 'deck') playEnergyFromDeckAction();
    else if (source === 'discard') playEnergyFromDiscardAction();
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-yellow-400">LORKEMON</h1>
          <span className="text-sm text-slate-400">Turno {turn}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${isPlayerTurn ? 'bg-blue-700 text-white' : 'bg-red-700 text-white'}`}>
            {aiThinking ? '⏳ IA pensando...' : isPlayerTurn ? '🟦 Sua vez' : '🟥 Vez da IA'}
          </span>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-blue-300">Você: <strong>{players.player.points}</strong>/20 pts</span>
          <span className="text-red-300">IA: <strong>{players.ai.points}</strong>/20 pts</span>
        </div>
        <div className="flex gap-2">
          {attackMode && (
            <button
              onClick={() => setAttackMode(null)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
            >
              Cancelar Ataque
            </button>
          )}
          {isPlayerTurn && !attackMode && !aiThinking && gameState.phase !== 'end' && (
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

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-10 text-center shadow-2xl">
            <div className="text-5xl mb-4">{result === 'player_wins' ? '🏆' : '💀'}</div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              {result === 'player_wins' ? 'Você Venceu!' : 'IA Venceu!'}
            </h2>
            <p className="text-slate-400 mb-6">
              Turno {turn} · Placar final — Você: {players.player.points} | IA: {players.ai.points}
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

      {/* Attack mode banner */}
      {attackMode && (
        <div className="bg-orange-700 text-white text-sm text-center py-1 flex-shrink-0">
          ⚔️ Selecione um Pokémon vulnerável do oponente para atacar
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {/* Left: Boards */}
        <div className="flex flex-col flex-1 gap-2 overflow-y-auto scrollbar-hide">
          {/* AI Board */}
          <PlayerBoard
            playerState={players.ai}
            isCurrentPlayer={currentPlayer === 'ai'}
            isOpponent={true}
            attackMode={attackMode}
            onSelectAttackTarget={handleSelectTarget}
          />

          {/* Player Board */}
          <PlayerBoard
            playerState={players.player}
            isCurrentPlayer={isPlayerTurn}
            isOpponent={false}
            onPlayEnergy={handleEnergyPlay}
            onSummon={summonAction}
            onAttack={handleAttack}
            onPlayTrainer={playTrainerAction}
            attackMode={attackMode}
          />
        </div>

        {/* Right: Game Log */}
        <div className="w-72 flex-shrink-0">
          <GameLog entries={gameState.log} />
        </div>
      </div>
    </div>
  );
}
