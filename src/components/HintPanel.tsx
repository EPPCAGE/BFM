import type { GameState } from '../game/types';
import type { PokemonCardDef } from '../game/types';
import { availableEnergy, canAttack, canEvolve } from '../game/engine';

interface Hint {
  icon: string;
  text: string;
  priority: number;
}

function buildHints(gs: GameState): Hint[] {
  const hints: Hint[] = [];
  const p = gs.players.player;
  const ai = gs.players.ai;
  const energy = availableEnergy(p);

  if (gs.pendingDeckSearch) {
    return [{ icon: '🔍', text: 'Escolha um Pokémon do deck no painel que abriu.', priority: 0 }];
  }
  if (gs.pendingFreeSummon) {
    return [{ icon: '🔄', text: 'Switch ativo — clique em um Pokémon Básico da sua mão para colocá-lo em jogo gratuitamente.', priority: 0 }];
  }

  if (p.playArea.length === 0) {
    hints.push({ icon: '⚠️', text: 'Você não tem nenhum Pokémon em jogo! Invoque um Básico da mão o quanto antes.', priority: 0 });
  }

  if (!p.energyPlayedThisTurn) {
    hints.push({ icon: '⚡', text: 'Baixe uma energia: clique em uma carta da mão e escolha "Usar como Energia".', priority: 1 });
  }

  const basicInHand = p.hand.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic');
  const canSummonAny = basicInHand.some(c => p.playArea.length < 5 && energy >= (c as PokemonCardDef).retreatCost);
  if (canSummonAny) {
    hints.push({ icon: '🐾', text: 'Invoque um Pokémon: clique em um Básico da mão e escolha "Invocar Pokémon".', priority: 2 });
  } else if (basicInHand.length > 0 && p.playArea.length < 5) {
    hints.push({ icon: '⚡', text: 'Você tem Básicos na mão mas precisa de mais energia para invocá-los.', priority: 2 });
  }

  const canEvolveAny = p.playArea.some(pk =>
    p.hand.some(c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName && canEvolve(gs, 'player', pk.instanceId, c.id))
  );
  if (canEvolveAny) {
    hints.push({ icon: '✨', text: 'Evolução disponível! Clique em um Pokémon em jogo e use o botão roxo de evolução.', priority: 2 });
  }

  const vulnerableTargets = ai.playArea.filter(pk => pk.vulnerability === 'vulnerable');
  const canAttackAny = p.playArea.some(pk =>
    pk.def.attacks.some((_, i) => canAttack(gs, 'player', pk.instanceId, i))
  );
  if (vulnerableTargets.length > 0 && canAttackAny) {
    hints.push({ icon: '⚔️', text: 'Ataque! Clique em um seu Pokémon, escolha o ataque e clique no alvo inimigo.', priority: 2 });
  } else if (vulnerableTargets.length > 0 && !canAttackAny) {
    hints.push({ icon: '⚡', text: 'Há alvos vulneráveis mas falta energia para atacar.', priority: 2 });
  } else if (vulnerableTargets.length === 0 && p.playArea.length > 0) {
    hints.push({ icon: '🛡️', text: 'Nenhum inimigo vulnerável. Encerre o turno para o oponente agir.', priority: 4 });
  }

  const hasTrainer = p.hand.some(c => c.type === 'item' || c.type === 'supporter');
  if (hasTrainer) {
    hints.push({ icon: '🃏', text: 'Você tem Treinadores na mão. Clique neles para ver as opções.', priority: 3 });
  }

  hints.push({ icon: '✔️', text: 'Encerre o turno quando terminar suas ações.', priority: 5 });

  return hints.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

interface Props {
  gameState: GameState;
}

export function HintPanel({ gameState }: Props) {
  if (!gameState || gameState.currentPlayer !== 'player' || gameState.phase === 'end') return null;

  const hints = buildHints(gameState);

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 flex-shrink-0">
      <div className="text-xs font-bold text-yellow-400 mb-2">💡 Dicas</div>
      <div className="flex flex-col gap-2">
        {hints.map((h, i) => (
          <div key={i} className="flex gap-2 text-xs text-slate-200 leading-snug">
            <span className="flex-shrink-0 text-sm">{h.icon}</span>
            <span>{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
