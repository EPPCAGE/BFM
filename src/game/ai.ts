import type { GameState, PlayerId } from './types';
import type { PokemonCardDef } from './types';
import {
  canSummon, summonPokemon, canAttack, performAttack,
  canPlayTrainer, playTrainer, playEnergyFromHand, playEnergyFromDeck,
  endTurn, opponent,
} from './engine';

// Stub: deck-search feature not yet implemented in engine
function autoCompleteDeckSearch(state: GameState, _pid: PlayerId): GameState {
  return state;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Record a snapshot after each meaningful AI action
function snap(s: GameState, steps: GameState[]): GameState {
  steps.push(s);
  return s;
}

// ─── Easy AI: attack whenever possible ────────────────────────────────────────

function aiEasy(state: GameState, steps: GameState[]): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = snap(playEnergyFromHand(s, pid, handIdx), steps);
    else s = snap(playEnergyFromDeck(s, pid), steps);
  }

  const handSnapshot = [...s.players[pid].hand];
  for (const card of handSnapshot) {
    if (card.type === 'pokemon' && canSummon(s, pid, card.id)) {
      s = snap(summonPokemon(s, pid, card.id), steps);
    }
  }

  const attackers = [...s.players[pid].playArea];
  for (const attacker of attackers) {
    if (attacker.hasAttackedThisTurn) continue;
    const targets = s.players[opponent(pid)].playArea.filter(pk => pk.vulnerability === 'vulnerable');
    if (targets.length === 0) break;
    const target = targets[0];
    for (let i = 0; i < attacker.def.attacks.length; i++) {
      if (canAttack(s, pid, attacker.instanceId, i)) {
        s = snap(performAttack(s, pid, attacker.instanceId, i, target.instanceId), steps);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  return endTurn(s);
}

// ─── Medium AI: prioritize high-point targets ─────────────────────────────────

function aiMedium(state: GameState, steps: GameState[]): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = snap(playEnergyFromHand(s, pid, handIdx), steps);
    else s = snap(playEnergyFromDeck(s, pid), steps);
  }

  const handSnap1 = [...s.players[pid].hand];
  for (const card of handSnap1) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
        s = snap(autoCompleteDeckSearch(s, pid), steps);
        if (s.phase === 'end') return s;
      }
    }
  }

  const handSnap2 = s.players[pid].hand
    .filter(c => c.type === 'pokemon')
    .sort((a, b) => (b as PokemonCardDef).hp - (a as PokemonCardDef).hp);
  for (const card of handSnap2) {
    if (canSummon(s, pid, card.id)) {
      s = snap(summonPokemon(s, pid, card.id), steps);
    }
  }

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
      s = snap(performAttack(s, pid, attacker.instanceId, bestAttack.i, target.instanceId), steps);
      if (s.phase === 'end') return s;
    }
  }

  return endTurn(s);
}

// ─── Hard AI: evaluate points, vulnerability, exhaustion, energy economy ──────

function aiHard(state: GameState, steps: GameState[]): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const trainerIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (trainerIdx >= 0) s = snap(playEnergyFromHand(s, pid, trainerIdx), steps);
    else s = snap(playEnergyFromDeck(s, pid), steps);
  }

  const handSnap1 = [...s.players[pid].hand];
  for (const card of handSnap1) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'ultra-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
        s = snap(autoCompleteDeckSearch(s, pid), steps);
        if (s.phase === 'end') return s;
      }
    }
  }

  const pokemonInHand = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  const handSnap2 = [...pokemonInHand];
  for (const card of handSnap2) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      const hasEvolution = pokemonInHand.some(c => c.evolvesFrom === card.displayName);
      if (hasEvolution) {
        s = snap(summonPokemon(s, pid, card.id), steps);
      }
    }
  }
  const handSnap3 = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  for (const card of handSnap3) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      s = snap(summonPokemon(s, pid, card.id), steps);
    }
  }

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
        s = snap(performAttack(s, pid, attacker.instanceId, bestAttack.i, target.instanceId), steps);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  const handSnap4 = [...s.players[pid].hand];
  for (const card of handSnap4) {
    if ((card.id === 'potion' || card.id === 'super-potion') && canPlayTrainer(s, pid, card.id)) {
      const wounded = s.players[pid].playArea
        .filter(pk => pk.currentHp < pk.def.hp * 0.5)
        .sort((a, b) => a.currentHp - b.currentHp)[0];
      if (wounded) {
        s = snap(playTrainer(s, pid, card.id, wounded.instanceId), steps);
        if (s.phase === 'end') return s;
      }
    }
  }

  return endTurn(s);
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export function runAITurn(state: GameState, difficulty: AIDifficulty): GameState[] {
  const steps: GameState[] = [];
  let final: GameState;
  switch (difficulty) {
    case 'easy':   final = aiEasy(state, steps);   break;
    case 'medium': final = aiMedium(state, steps); break;
    case 'hard':   final = aiHard(state, steps);   break;
  }
  steps.push(final!);
  return steps;
}
