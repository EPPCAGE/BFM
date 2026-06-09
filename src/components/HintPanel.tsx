import { useState } from 'react';
import type { GameState } from '../game/types';
import type { PokemonCardDef } from '../game/types';
import { availableEnergy, canAttack, canEvolve } from '../game/engine';

interface Hint {
  icon: string;
  text: string;
  priority: number; // lower = more urgent
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

  // Energy
  if (!p.energyPlayedThisTurn) {
    hints.push({ icon: '⚡', text: 'Você ainda não baixou energia este turno. Passe o mouse em uma carta da mão e clique ⚡ para usá-la como energia.', priority: 1 });
  }

  // Summon
  const basicInHand = p.hand.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic');
  const canSummonAny = basicInHand.some(c => {
    const def = c as PokemonCardDef;
    return p.playArea.length < 5 && energy >= def.retreatCost;
  });
  if (canSummonAny) {
    hints.push({ icon: '🐾', text: 'Você tem Pokémon Básico na mão para invocar. Clique na carta dele na mão.', priority: 2 });
  } else if (basicInHand.length > 0 && !canSummonAny && p.playArea.length < 5) {
    hints.push({ icon: '⚡', text: 'Você tem Básicos na mão mas não tem energia suficiente para invocá-los. Baixe mais energia primeiro.', priority: 2 });
  }

  // Evolution
  const canEvolveAny = p.playArea.some(pk =>
    p.hand.some(c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName && canEvolve(gs, 'player', pk.instanceId, c.id))
  );
  if (canEvolveAny) {
    hints.push({ icon: '✨', text: 'Você pode evoluir um Pokémon! Passe o mouse sobre ele no campo e clique no botão roxo de evolução.', priority: 2 });
  }

  // Trainers
  const hasTrainer = p.hand.some(c => c.type === 'item' || c.type === 'supporter');
  if (hasTrainer && energy > 0) {
    hints.push({ icon: '🃏', text: 'Você tem cartas de Treinador na mão. Clique nelas para jogá-las.', priority: 3 });
  }

  // Attack
  const vulnerableTargets = ai.playArea.filter(pk => pk.vulnerability === 'vulnerable');
  const canAttackAny = p.playArea.some(pk =>
    pk.def.attacks.some((_, i) => canAttack(gs, 'player', pk.instanceId, i))
  );
  if (vulnerableTargets.length > 0 && canAttackAny) {
    hints.push({ icon: '⚔️', text: 'Pokémon do oponente estão vulneráveis! Passe o mouse sobre seu Pokémon e escolha um ataque — depois clique no alvo.', priority: 2 });
  } else if (vulnerableTargets.length === 0 && p.playArea.length > 0) {
    hints.push({ icon: '🛡️', text: 'Nenhum Pokémon inimigo está vulnerável ainda. Encerre o turno para o oponente agir.', priority: 4 });
  } else if (vulnerableTargets.length > 0 && !canAttackAny) {
    hints.push({ icon: '⚡', text: 'Há alvos vulneráveis, mas seus Pokémon não têm energia suficiente para atacar. Baixe mais energia.', priority: 2 });
  }

  // No pokemon in play
  if (p.playArea.length === 0) {
    hints.push({ icon: '⚠️', text: 'Você não tem nenhum Pokémon em jogo! Invoque um Básico da mão o quanto antes.', priority: 0 });
  }

  // End turn reminder (always last)
  hints.push({ icon: '✔️', text: 'Quando terminar suas ações, clique em "Encerrar Turno →" no canto superior direito.', priority: 5 });

  return hints.sort((a, b) => a.priority - b.priority);
}

interface Props {
  gameState: GameState;
}

export function HintPanel({ gameState }: Props) {
  const [open, setOpen] = useState(true);

  if (!gameState || gameState.currentPlayer !== 'player' || gameState.phase === 'end') return null;

  const hints = buildHints(gameState);
  const topHints = hints.slice(0, 3);

  return (
    <div className="fixed bottom-3 left-3 z-40 w-72">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-t-lg border border-slate-500"
      >
        <span>💡 Dicas</span>
        <span>{open ? '▼' : '▲'}</span>
      </button>
      {open && (
        <div className="bg-slate-800 border border-t-0 border-slate-500 rounded-b-lg p-2 flex flex-col gap-1.5">
          {topHints.map((h, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-200 leading-snug">
              <span className="flex-shrink-0">{h.icon}</span>
              <span>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
