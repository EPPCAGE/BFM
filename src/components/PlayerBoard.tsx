import { useState, useRef, useEffect } from 'react';
import type { PlayerState } from '../game/types';
import type { PokemonCardDef } from '../game/types';
import { PokemonCard } from './PokemonCard';
import { EnergyPool } from './EnergyPool';
import { CardImage } from './CardImage';
import { CardTooltip } from './CardTooltip';
import { availableEnergy } from '../game/engine';
import { useTooltip } from '../hooks/useTooltip';
import { playSound } from '../utils/sounds';

// Trainers that need a friendly target
const FRIENDLY_TARGET_TRAINERS = new Set(['potion', 'super-potion', 'switch', 'rare-candy']);
// Trainers that need an enemy target
const ENEMY_TARGET_TRAINERS = new Set(['bosss-orders']);

interface CardMenu {
  idx: number;
  x: number;
  y: number;
}

interface Props {
  playerState: PlayerState;
  isCurrentPlayer: boolean;
  isOpponent: boolean;

  onPlayEnergy?: (source: 'hand' | 'deck' | 'discard', index?: number) => void;
  onSummon?: (cardId: string) => void;
  onAttack?: (attackerInstanceId: string, attackIndex: number) => void;
  onEvolve?: (targetInstanceId: string, evolvedCardId: string) => void;
  onPlayTrainer?: (cardId: string, targetInstanceId?: string) => void;

  attackMode?: { attackerInstanceId: string; attackIndex: number } | null;
  onSelectAttackTarget?: (targetInstanceId: string) => void;

  pendingTrainer?: { cardId: string; targetType: 'friendly' | 'enemy' } | null;
  onSelectTrainerTarget?: (targetInstanceId: string) => void;

  pendingTeleport?: boolean;
  onSelectTeleportHandCard?: (handIndex: number) => void;
}

export function PlayerBoard({
  playerState, isCurrentPlayer, isOpponent,
  onPlayEnergy, onSummon, onAttack, onEvolve, onPlayTrainer,
  attackMode, onSelectAttackTarget,
  pendingTrainer, onSelectTrainerTarget,
  pendingTeleport, onSelectTeleportHandCard,
}: Props) {
  const energy = availableEnergy(playerState);
  const label = isOpponent ? 'Oponente (IA)' : 'Você';
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [cardMenu, setCardMenu] = useState<CardMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!cardMenu) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCardMenu(null);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [cardMenu]);

  const isSelectingFriendly = !isOpponent && pendingTrainer?.targetType === 'friendly';
  const isSelectingEnemy = isOpponent && pendingTrainer?.targetType === 'enemy';

  function handleHandClick(idx: number, e: React.MouseEvent) {
    if (isOpponent || !isCurrentPlayer) return;
    const card = playerState.hand[idx];
    if (!card) return;

    // In teleport mode just pick directly
    if (pendingTeleport) {
      if (card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic') {
        playSound('card');
        onSelectTeleportHandCard?.(idx);
      }
      return;
    }

    hideTooltip();
    // Open action menu relative to card
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCardMenu({ idx, x: rect.left, y: rect.top });
  }

  function commitAction(action: 'energy' | 'summon' | 'trainer') {
    if (!cardMenu) return;
    const idx = cardMenu.idx;
    const card = playerState.hand[idx];
    setCardMenu(null);

    if (action === 'energy') {
      playSound('energy');
      onPlayEnergy?.('hand', idx);
    } else if (action === 'summon') {
      playSound('summon');
      onSummon?.(card.id);
    } else if (action === 'trainer') {
      playSound('trainer');
      if (FRIENDLY_TARGET_TRAINERS.has(card.id)) {
        onPlayTrainer?.(card.id, '__SELECT_FRIENDLY__');
      } else if (ENEMY_TARGET_TRAINERS.has(card.id)) {
        onPlayTrainer?.(card.id, '__SELECT_ENEMY__');
      } else {
        onPlayTrainer?.(card.id);
      }
    }
  }

  function handlePlayAreaClick(instanceId: string) {
    if (attackMode && isOpponent) {
      playSound('attack');
      onSelectAttackTarget?.(instanceId);
      return;
    }
    if (isSelectingFriendly || isSelectingEnemy) {
      playSound('card');
      onSelectTrainerTarget?.(instanceId);
      return;
    }
  }

  // Build action menu options for the selected card
  const menuCard = cardMenu !== null ? playerState.hand[cardMenu.idx] : null;
  const menuOptions: { label: string; action: 'energy' | 'summon' | 'trainer' }[] = [];
  if (menuCard) {
    const isBasic = menuCard.type === 'pokemon' && (menuCard as PokemonCardDef).stage === 'Basic';
    const isTrainer = menuCard.type === 'item' || menuCard.type === 'supporter';
    if (isBasic) menuOptions.push({ label: '🐾 Invocar Pokémon', action: 'summon' });
    if (isTrainer) menuOptions.push({ label: '🃏 Jogar Treinador', action: 'trainer' });
    if (!playerState.energyPlayedThisTurn) menuOptions.push({ label: '⚡ Usar como Energia', action: 'energy' });
  }

  return (
    <div className={`flex flex-col gap-2 p-2 rounded-xl border ${
      isCurrentPlayer ? 'border-blue-500/50 bg-slate-800/60' : 'border-slate-700 bg-slate-900/60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`font-bold text-sm ${isOpponent ? 'text-red-300' : 'text-blue-300'}`}>{label}</span>
          {isCurrentPlayer && (
            <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">Seu Turno</span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-slate-300">
          <span>🏆 <strong className="text-white">{playerState.points}</strong>/10</span>
          <span>🃏 Deck: {playerState.deckCards.length}</span>
          <span>✋ Mão: {playerState.hand.length}</span>
          <span>⚡ <strong className="text-yellow-300">{energy}</strong></span>
        </div>
      </div>

      {/* Energy Pool */}
      <EnergyPool energyPool={playerState.energyPool} label={label} />

      {/* Play Area + Discard */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">
        <div className="text-xs text-slate-400 mb-1 font-semibold">
          Em Jogo ({playerState.playArea.length}/5)
          {isSelectingFriendly && <span className="ml-2 text-green-400 animate-pulse">← Selecione o alvo</span>}
          {isSelectingEnemy && <span className="ml-2 text-orange-400 animate-pulse">← Selecione o alvo</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {playerState.playArea.map((pokemon) => {
            const isAttackTarget = !!attackMode && isOpponent && pokemon.vulnerability === 'vulnerable';
            // Boss's Orders targets only READY opponent pokemon
            const isTrainerTarget = isSelectingFriendly ||
              (isSelectingEnemy && pokemon.vulnerability === 'ready');
            const evolutionCard = !isOpponent && isCurrentPlayer
              ? playerState.hand.find(c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pokemon.def.displayName) as PokemonCardDef | undefined
              : undefined;
            return (
              <div
                key={pokemon.instanceId}
                data-card-hover
                onMouseEnter={(e) => { if (!cardMenu) showTooltip(pokemon.def, e); }}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <PokemonCard
                  pokemon={pokemon}
                  isTargetable={isAttackTarget || isTrainerTarget}
                  evolutionCard={evolutionCard}
                  onEvolve={evolutionCard ? () => { playSound('evolve'); onEvolve?.(pokemon.instanceId, evolutionCard.id); } : undefined}
                  showAttacks={!isOpponent && isCurrentPlayer && !pendingTrainer && !attackMode}
                  canAffordAttack={(cost) => energy >= cost}
                  onAttack={(attackIndex) => {
                    if (!isOpponent) onAttack?.(pokemon.instanceId, attackIndex);
                  }}
                  onClick={() => handlePlayAreaClick(pokemon.instanceId)}
                />
              </div>
            );
          })}
          {playerState.playArea.length === 0 && (
            <span className="text-slate-500 text-xs italic">Nenhum Pokémon em jogo</span>
          )}
        </div>
        </div>

        {/* Discard Pile */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="text-xs text-slate-400 font-semibold">Descarte</div>
          {(() => {
            const top = playerState.discardPile.length > 0
              ? playerState.discardPile[playerState.discardPile.length - 1]
              : null;
            return (
              <div
                className="relative rounded-lg overflow-hidden border border-slate-600"
                style={{ width: 56, height: 78 }}
                data-card-hover
                onMouseEnter={(e) => { if (top && !cardMenu) showTooltip(top, e); }}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                {top ? (
                  <>
                    <CardImage card={top} className="w-full h-full" />
                    {playerState.discardPile.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-center text-slate-300">
                        ×{playerState.discardPile.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 text-[10px]">vazio</div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Hand */}
      {!isOpponent && (
        <div>
          <div className="text-xs text-slate-400 mb-1 font-semibold">Mão — clique em uma carta para ver as opções</div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {playerState.hand.map((card, idx) => {
              const isTeleportTarget = pendingTeleport && card.type === 'pokemon' && (card as PokemonCardDef).stage === 'Basic';
              const isMenuOpen = cardMenu?.idx === idx;
              return (
                <div
                  key={`${card.id}-${idx}`}
                  className={`relative card-in-hand rounded-lg cursor-pointer flex-shrink-0 ${
                    isTeleportTarget ? 'ring-2 ring-indigo-400 animate-pulse' : ''
                  } ${isMenuOpen ? 'ring-2 ring-yellow-400' : ''}`}
                  style={{ width: 90, height: 126 }}
                  data-card-hover
                  onClick={(e) => handleHandClick(idx, e)}
                  onMouseEnter={(e) => { if (!cardMenu) showTooltip(card, e); }}
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
                </div>
              );
            })}
            {playerState.hand.length === 0 && (
              <span className="text-slate-500 text-xs italic">Mão vazia</span>
            )}
          </div>
        </div>
      )}

      {/* Card action menu */}
      {cardMenu && menuOptions.length > 0 && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-slate-800 border border-slate-500 rounded-lg shadow-2xl p-1 flex flex-col gap-0.5"
          style={{ left: cardMenu.x, top: Math.max(8, cardMenu.y - menuOptions.length * 36 - 8) }}
        >
          {menuOptions.map(opt => (
            <button
              key={opt.action}
              onClick={() => commitAction(opt.action)}
              className="text-left text-sm text-white px-3 py-2 rounded hover:bg-slate-600 whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setCardMenu(null)}
            className="text-left text-xs text-slate-400 px-3 py-1 rounded hover:bg-slate-700"
          >
            ✕ Cancelar
          </button>
        </div>
      )}

      {tooltip && !cardMenu && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
