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
    <div className={`flex flex-col gap-2 p-2.5 rounded-2xl ${isOpponent ? 'zone-opponent' : 'zone-player'}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar icon */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ${
            isOpponent
              ? 'bg-gradient-to-br from-red-700 to-red-900 border border-red-500/50 text-red-100'
              : 'bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/50 text-blue-100'
          }`}>
            {isOpponent ? '🤖' : '🧑'}
          </div>
          <span className={`font-extrabold text-sm tracking-wide ${isOpponent ? 'text-red-300' : 'text-blue-300'}`}>{label}</span>
          {isCurrentPlayer && (
            <span className="text-[10px] bg-gradient-to-r from-green-700 to-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-md border border-green-500/40">
              ● Sua Vez
            </span>
          )}
        </div>
        <div className="flex gap-3 text-xs text-slate-400 bg-black/30 rounded-xl px-3 py-1 border border-white/5">
          <span>🏆 <strong className="text-white">{playerState.points}</strong><span className="text-slate-600">/10</span></span>
          <span className="text-slate-600">|</span>
          <span>🃏 <span className="text-slate-300">{playerState.deckCards.length}</span></span>
          <span className="text-slate-600">|</span>
          <span>✋ <span className="text-slate-300">{playerState.hand.length}</span></span>
          <span className="text-slate-600">|</span>
          <span>⚡ <strong className="text-yellow-300">{energy}</strong></span>
        </div>
      </div>

      {/* Energy Pool */}
      <EnergyPool energyPool={playerState.energyPool} label={label} />

      {/* Play Area + Discard */}
      <div className="flex gap-2 items-start">
        <div className="flex-1 bg-black/20 rounded-xl p-2 border border-white/5">
        <div className="text-[10px] text-slate-400 mb-1.5 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOpponent ? 'bg-red-500' : 'bg-blue-500'}`} />
          Em Jogo ({playerState.playArea.length}/5)
          {isSelectingFriendly && <span className="ml-2 text-green-400 animate-pulse font-semibold normal-case tracking-normal">← Selecione o alvo</span>}
          {isSelectingEnemy && <span className="ml-2 text-orange-400 animate-pulse font-semibold normal-case tracking-normal">← Selecione o alvo</span>}
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
        <div className="flex-shrink-0 flex flex-col gap-1" style={{ width: 160 }}>
          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase flex items-center justify-between">
            <span>Descarte</span>
            {playerState.discardPile.length > 0 && (
              <span className="text-slate-600 font-normal">×{playerState.discardPile.length}</span>
            )}
          </div>
          {playerState.discardPile.length === 0 ? (
            <div className="flex items-center justify-center text-slate-600 text-[10px] rounded-lg" style={{ height: 95, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              vazio
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {[...playerState.discardPile].reverse().slice(0, 8).map((card, i) => (
                <div
                  key={i}
                  className="relative rounded overflow-hidden flex-shrink-0"
                  style={{ width: 54, height: 75, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', opacity: i === 0 ? 1 : 0.75 - i * 0.05 }}
                  data-card-hover
                  onMouseEnter={(e) => { if (!cardMenu) showTooltip(card, e); }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <CardImage card={card} className="w-full h-full" />
                  {i === 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-500/80 text-[7px] text-center text-black font-bold leading-tight py-px">TOPO</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opponent hand — face down */}
      {isOpponent && playerState.hand.length > 0 && (
        <div>
          <div className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            Mão ({playerState.hand.length})
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {playerState.hand.map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: 72, height: 100,
                  background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#1e1b4b 100%)',
                  border: '2px solid rgba(99,102,241,0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                }}
              >
                {/* Card back pattern */}
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-1.5 rounded"
                    style={{
                      background: 'linear-gradient(135deg,#4338ca,#6d28d9)',
                      border: '1px solid rgba(167,139,250,0.3)',
                    }}
                  />
                  <div className="absolute inset-3 rounded-sm"
                    style={{
                      background: 'radial-gradient(ellipse at center,rgba(196,181,253,0.15) 0%,transparent 70%)',
                      border: '1px solid rgba(167,139,250,0.2)',
                    }}
                  />
                  <span className="relative text-2xl opacity-60">🎴</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hand */}
      {!isOpponent && (
        <div>
          <div className="text-[10px] text-slate-400 mb-1.5 font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Mão
            <span className="text-slate-600 font-normal normal-case tracking-normal text-[10px]">— clique em uma carta para ações</span>
          </div>
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
                  style={{ width: 108, height: 151 }}
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
          className="fixed z-50 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5"
          style={{
            left: cardMenu.x,
            top: Math.max(8, cardMenu.y - menuOptions.length * 40 - 12),
            background: 'linear-gradient(145deg,#1e293b,#0f172a)',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {menuOptions.map(opt => (
            <button
              key={opt.action}
              onClick={() => commitAction(opt.action)}
              className="text-left text-sm text-white px-4 py-2.5 rounded-lg hover:bg-white/10 whitespace-nowrap font-semibold transition-colors"
            >
              {opt.label}
            </button>
          ))}
          <div className="h-px bg-white/10 my-0.5" />
          <button
            onClick={() => setCardMenu(null)}
            className="text-left text-xs text-slate-500 px-4 py-1.5 rounded-lg hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            ✕ Cancelar
          </button>
        </div>
      )}

      {tooltip && !cardMenu && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
