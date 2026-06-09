import type { GameState, PlayerId } from './types';
import type { PokemonCardDef } from './types';
import {
  canSummon, summonPokemon, canAttack, performAttack,
  canPlayTrainer, playTrainer, playEnergyFromHand, playEnergyFromDeck,
  endTurn, opponent, completeDeckSearch,
} from './engine';

function autoCompleteDeckSearch(state: GameState, pid: PlayerId): GameState {
  if (!state.pendingDeckSearch) return state;
  const first = state.pendingDeckSearch.candidates[0];
  if (!first) return { ...state, pendingDeckSearch: null };
  return completeDeckSearch(state, pid, first.id);
}

type AIDifficulty = 'easy' | 'medium' | 'hard';

// ─── Easy AI: attack whenever possible ────────────────────────────────────────

function aiEasy(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  // Play energy from hand (prefer non-pokemon) if possible
  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Summon using a snapshot of hand (hand changes as pokemon are summoned)
  const handSnapshot = [...s.players[pid].hand];
  for (const card of handSnapshot) {
    if (card.type === 'pokemon' && canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack with all pokemon that can
  const attackers = [...s.players[pid].playArea];
  for (const attacker of attackers) {
    if (attacker.hasAttackedThisTurn) continue;
    const targets = s.players[opponent(pid)].playArea.filter(pk => pk.vulnerability === 'vulnerable');
    if (targets.length === 0) break;
    const target = targets[0];
    for (let i = 0; i < attacker.def.attacks.length; i++) {
      if (canAttack(s, pid, attacker.instanceId, i)) {
        s = performAttack(s, pid, attacker.instanceId, i, target.instanceId);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  return endTurn(s);
}

// ─── Medium AI: prioritize high-point targets ─────────────────────────────────

function aiMedium(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  // Play energy
  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Play draw items using snapshot
  const handSnap1 = [...s.players[pid].hand];
  for (const card of handSnap1) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
        s = autoCompleteDeckSearch(s, pid);
        if (s.phase === 'end') return s;
      }
    }
  }

  // Summon highest-HP pokemon using snapshot
  const handSnap2 = s.players[pid].hand
    .filter(c => c.type === 'pokemon')
    .sort((a, b) => (b as PokemonCardDef).hp - (a as PokemonCardDef).hp);
  for (const card of handSnap2) {
    if (canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack highest-point target
  const targets = s.players[opponent(pid)].playArea
    .filter(pk => pk.vulnerability === 'vulnerable')
    .sort((a, b) => b.def.pointValue - a.def.pointValue);

  const attackers = [...s.players[pid].playArea];
  for (const attacker of attackers) {
    if (attacker.hasAttackedThisTurn || targets.length === 0) continue;
    const target = targets[0];
    const bestAttack = attacker.def.attacks
      .map((a, i) => ({ a, i }))
      .filter(x => canAttack(s, pid, attacker.instanceId, x.i))
      .sort((x, y) => y.a.damage - x.a.damage)[0];
    if (bestAttack) {
      s = performAttack(s, pid, attacker.instanceId, bestAttack.i, target.instanceId);
      if (s.phase === 'end') return s;
    }
  }

  return endTurn(s);
}

// ─── Hard AI: evaluate points, vulnerability, exhaustion, energy economy ──────

function aiHard(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  // Energy: prioritise non-pokemon from hand to pool
  if (!s.players[pid].energyPlayedThisTurn) {
    const trainerIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (trainerIdx >= 0) s = playEnergyFromHand(s, pid, trainerIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Use draw items using snapshot
  const handSnap1 = [...s.players[pid].hand];
  for (const card of handSnap1) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'ultra-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
        s = autoCompleteDeckSearch(s, pid);
        if (s.phase === 'end') return s;
      }
    }
  }

  // Summon: prefer basics that have evolutions in hand
  const pokemonInHand = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  const handSnap2 = [...pokemonInHand];
  for (const card of handSnap2) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      const hasEvolution = pokemonInHand.some(c => c.evolvesFrom === card.displayName);
      if (hasEvolution) {
        s = summonPokemon(s, pid, card.id);
      }
    }
  }
  // Summon remaining basics using fresh snapshot
  const handSnap3 = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  for (const card of handSnap3) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack: prioritise targets with lowest (hp/pointValue) ratio (cheapest to kill per point)
  const targets = s.players[opponent(pid)].playArea
    .filter(pk => pk.vulnerability === 'vulnerable')
    .sort((a, b) => (a.currentHp / a.def.pointValue) - (b.currentHp / b.def.pointValue));

  const attackers = [...s.players[pid].playArea];
  for (const attacker of attackers) {
    if (attacker.hasAttackedThisTurn) continue;
    for (const target of targets) {
      const bestAttack = attacker.def.attacks
        .map((a, i) => ({ a, i }))
        .filter(x => canAttack(s, pid, attacker.instanceId, x.i))
        .sort((x, y) => y.a.damage - x.a.damage)[0];
      if (bestAttack) {
        s = performAttack(s, pid, attacker.instanceId, bestAttack.i, target.instanceId);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  // Heal wounded pokemon using snapshot
  const handSnap4 = [...s.players[pid].hand];
  for (const card of handSnap4) {
    if ((card.id === 'potion' || card.id === 'super-potion') && canPlayTrainer(s, pid, card.id)) {
      const wounded = s.players[pid].playArea
        .filter(pk => pk.currentHp < pk.def.hp * 0.5)
        .sort((a, b) => a.currentHp - b.currentHp)[0];
      if (wounded) {
        s = playTrainer(s, pid, card.id, wounded.instanceId);
        if (s.phase === 'end') return s;
      }
    }
  }

  return endTurn(s);
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export function runAITurn(state: GameState, difficulty: AIDifficulty): GameState {
  switch (difficulty) {
    case 'easy': return aiEasy(state);
    case 'medium': return aiMedium(state);
    case 'hard': return aiHard(state);
  }
}
