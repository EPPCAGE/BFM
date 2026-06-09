import { useState } from 'react';
import type { PlayerState } from '../game/types';
import type { PokemonCardDef } from '../game/types';
import { PokemonCard } from './PokemonCard';
import { EnergyPool } from './EnergyPool';
import { CardImage } from './CardImage';
import { availableEnergy } from '../game/engine';

interface Props {
  playerState: PlayerState;
  isCurrentPlayer: boolean;
  isOpponent: boolean;

  // Actions (only passed for human player)
  onPlayEnergy?: (source: 'hand' | 'deck' | 'discard', index?: number) => void;
  onSummon?: (cardId: string) => void;
  onAttack?: (attackerInstanceId: string, attackIndex: number) => void;
  onPlayTrainer?: (cardId: string, targetInstanceId?: string) => void;

  // Attack mode: targeting
  attackMode?: { attackerInstanceId: string; attackIndex: number } | null;
  onSelectAttackTarget?: (targetInstanceId: string) => void;
}

export function PlayerBoard({
  playerState, isCurrentPlayer, isOpponent,
  onPlayEnergy, onSummon, onAttack, onPlayTrainer,
  attackMode, onSelectAttackTarget,
}: Props) {
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);
  const [attackingPokemon, setAttackingPokemon] = useState<string | null>(null);

  const energy = availableEnergy(playerState);
  const label = isOpponent ? 'Oponente (IA)' : 'Você';

  function handleHandClick(idx: number) {
    if (isOpponent || !isCurrentPlayer) return;
    const card = playerState.hand[idx];
    if (!card) return;

    if (selectedHandIdx === idx) {
      setSelectedHandIdx(null);
      return;
    }

    if (card.type === 'pokemon') {
      const def = card as PokemonCardDef;
      if (def.stage === 'Basic') {
        // Summon attempt
        onSummon?.(card.id);
        setSelectedHandIdx(null);
      } else {
        setSelectedHandIdx(idx);
      }
    } else if (card.type === 'item' || card.type === 'supporter') {
      onPlayTrainer?.(card.id);
      setSelectedHandIdx(null);
    }
  }

  function handleEnergyFromHand(idx: number) {
    if (isOpponent || !isCurrentPlayer) return;
    onPlayEnergy?.('hand', idx);
  }

  return (
    <div className={`flex flex-col gap-2 p-2 rounded-xl border ${
      isCurrentPlayer ? 'border-blue-500/50 bg-slate-800/60' : 'border-slate-700 bg-slate-900/60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`font-bold text-sm ${isOpponent ? 'text-red-300' : 'text-blue-300'}`}>
            {label}
          </span>
          {isCurrentPlayer && (
            <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">Seu Turno</span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-slate-300">
          <span>🏆 <strong className="text-white">{playerState.points}</strong>/20</span>
          <span>🃏 Deck: {playerState.deckCards.length}</span>
          <span>✋ Mão: {playerState.hand.length}</span>
          <span>⚡ Energia: <strong className="text-yellow-300">{energy}</strong></span>
        </div>
      </div>

      {/* Energy Pool */}
      <EnergyPool energyPool={playerState.energyPool} label={label} />

      {/* Play Area */}
      <div>
        <div className="text-xs text-slate-400 mb-1 font-semibold">
          Em Jogo ({playerState.playArea.length}/5)
        </div>
        <div className="flex flex-wrap gap-2">
          {playerState.playArea.map((pokemon) => {
            const isTarget = !!attackMode && pokemon.vulnerability === 'vulnerable';
            return (
              <PokemonCard
                key={pokemon.instanceId}
                pokemon={pokemon}
                isTargetable={isTarget}
                isSelected={attackingPokemon === pokemon.instanceId}
                showAttacks={!isOpponent && isCurrentPlayer && attackingPokemon === pokemon.instanceId}
                canAffordAttack={(cost) => energy >= cost}
                onAttack={(attackIndex) => {
                  if (attackMode) return;
                  onAttack?.(pokemon.instanceId, attackIndex);
                  setAttackingPokemon(null);
                }}
                onClick={() => {
                  if (attackMode && isOpponent) {
                    onSelectAttackTarget?.(pokemon.instanceId);
                    return;
                  }
                  if (!isOpponent && isCurrentPlayer) {
                    setAttackingPokemon(prev => prev === pokemon.instanceId ? null : pokemon.instanceId);
                  }
                }}
              />
            );
          })}
          {playerState.playArea.length === 0 && (
            <span className="text-slate-500 text-xs italic">Nenhum Pokémon em jogo</span>
          )}
        </div>
      </div>

      {/* Hand (hidden for opponent) */}
      {!isOpponent && (
        <div>
          <div className="text-xs text-slate-400 mb-1 font-semibold">Mão</div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {playerState.hand.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className={`relative card-in-hand rounded-lg cursor-pointer flex-shrink-0 ${
                  selectedHandIdx === idx ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{ width: 56, height: 78 }}
                title={card.displayName}
                onClick={() => handleHandClick(idx)}
                onContextMenu={(e) => { e.preventDefault(); handleEnergyFromHand(idx); }}
              >
                <CardImage card={card} className="w-full h-full" />
                {card.type === 'item' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-amber-700/80 text-[8px] text-center text-white">ITEM</div>
                )}
                {card.type === 'supporter' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-purple-700/80 text-[8px] text-center text-white">SUPORTE</div>
                )}
              </div>
            ))}
            {playerState.hand.length === 0 && (
              <span className="text-slate-500 text-xs italic">Mão vazia</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Clique na carta: Pokémon Básico = invocar | Trainer = jogar | Botão direito = energia
          </p>
        </div>
      )}

      {/* Energy source buttons */}
      {!isOpponent && isCurrentPlayer && !playerState.energyPlayedThisTurn && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 self-center">Adicionar energia:</span>
          <button
            onClick={() => onPlayEnergy?.('deck')}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
            disabled={playerState.deckCards.length === 0}
          >
            📦 Do Deck
          </button>
          <button
            onClick={() => onPlayEnergy?.('discard')}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
            disabled={playerState.discardPile.length === 0}
          >
            🗑️ Do Descarte
          </button>
        </div>
      )}
    </div>
  );
}
