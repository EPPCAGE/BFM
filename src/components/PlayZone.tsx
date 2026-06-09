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
}

export function PlayZone({
  playerState, isCurrentPlayer, isOpponent,
  onAttack, onEvolve,
  attackMode, onSelectAttackTarget,
  pendingTrainer, onSelectTrainerTarget,
}: Props) {
  const energy = availableEnergy(playerState);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  const isSelectingFriendly = !isOpponent && pendingTrainer?.targetType === 'friendly';
  const isSelectingEnemy = isOpponent && pendingTrainer?.targetType === 'enemy';

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
    <div className="flex items-center justify-center gap-3 flex-wrap">
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
            />
          </div>
        );
      })}
      {playerState.playArea.length === 0 && (
        <span className="text-slate-600 text-sm italic select-none">
          {isOpponent ? 'Sem Pokémon em jogo' : 'Arraste cartas da mão para invocar'}
        </span>
      )}
      {tooltip && <CardTooltip card={tooltip.card} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
