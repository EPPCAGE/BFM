/**
 * PlayZone — renders only the in-play Pokémon cards for one side of the field.
 * Used by the new centralized layout in GameBoard.
 */
import type { PlayerState } from '../game/types';
import type { PokemonCardDef } from '../game/types';
import { PokemonCard } from './PokemonCard';
import { CardTooltip } from './CardTooltip';
import { availableEnergy } from '../game/engine';
import { useTooltip } from '../hooks/useTooltip';

interface Props {
  playerState: PlayerState;
  isCurrentPlayer: boolean;
  isOpponent: boolean;

  onAttack?: (attackerInstanceId: string, attackIndex: number) => void;
  onEvolve?: (targetInstanceId: string, evolvedCardId: string) => void;

  attackMode?: { attackerInstanceId: string; attackIndex: number } | null;
  onSelectAttackTarget?: (targetInstanceId: string) => void;

  pendingTrainer?: { cardId: string; targetType: 'friendly' | 'enemy' } | null;
  onSelectTrainerTarget?: (targetInstanceId: string) => void;

  /** 'normal' = 90×120, 'large' = 110×154 */
  cardSize?: 'normal' | 'large';
}

export function PlayZone({
  playerState, isCurrentPlayer, isOpponent,
  onAttack, onEvolve,
  attackMode, onSelectAttackTarget,
  pendingTrainer, onSelectTrainerTarget,
  cardSize = 'normal',
}: Props) {
  const energy = availableEnergy(playerState);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  const isSelectingFriendly = !isOpponent && pendingTrainer?.targetType === 'friendly';
  const isSelectingEnemy = isOpponent && pendingTrainer?.targetType === 'enemy';

  const cardW = cardSize === 'large' ? 110 : 90;
  const cardH = cardSize === 'large' ? 154 : 120;

  function handlePlayAreaClick(instanceId: string) {
    if (attackMode && isOpponent) {
      onSelectAttackTarget?.(instanceId);
      return;
    }
    if (isSelectingFriendly || isSelectingEnemy) {
      onSelectTrainerTarget?.(instanceId);
      return;
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap px-4 py-2">
      {playerState.playArea.map((pokemon) => {
        const isAttackTarget = !!attackMode && isOpponent && pokemon.vulnerability === 'vulnerable';
        const isTrainerTarget = isSelectingFriendly || isSelectingEnemy;
        const evolutionCard = !isOpponent && isCurrentPlayer
          ? playerState.hand.find(
              c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pokemon.def.displayName
            ) as PokemonCardDef | undefined
          : undefined;
        return (
          <div
            key={pokemon.instanceId}
            onMouseEnter={(e) => showTooltip(pokemon.def, e)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <PokemonCard
              pokemon={pokemon}
              isTargetable={isAttackTarget || isTrainerTarget}
              evolutionCard={evolutionCard}
              onEvolve={evolutionCard ? () => onEvolve?.(pokemon.instanceId, evolutionCard.id) : undefined}
              showAttacks={!isOpponent && isCurrentPlayer && !pendingTrainer && !attackMode}
              canAffordAttack={(cost) => energy >= cost}
              onAttack={(attackIndex) => {
                if (!isOpponent) onAttack?.(pokemon.instanceId, attackIndex);
              }}
              onClick={() => handlePlayAreaClick(pokemon.instanceId)}
              cardWidth={cardW}
              cardHeight={cardH}
            />
          </div>
        );
      })}
      {playerState.playArea.length === 0 && (
        <div className="flex flex-col items-center gap-2 opacity-30 select-none pointer-events-none">
          <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
            <span className="text-slate-500 text-xs text-center px-2">
              {isOpponent ? 'Sem Pokémon' : 'Clique na carta para invocar'}
            </span>
          </div>
        </div>
      )}
      {tooltip && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
