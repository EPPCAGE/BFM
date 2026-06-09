import type { GameState, PlayerId } from './types';
import type { PokemonCardDef } from './types';
import {
  canSummon, summonPokemon, canAttack, performAttack,
  canPlayTrainer, playTrainer, playEnergyFromHand, playEnergyFromDeck,
  endTurn, opponent,
} from './engine';

type AIDifficulty = 'easy' | 'medium' | 'hard';

// ─── Easy AI: attack whenever possible ────────────────────────────────────────

function aiEasy(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = 'ai';

  // Play energy from hand if possible
  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Summon pokemon if possible
  for (const card of s.players[pid].hand) {
    if (card.type === 'pokemon' && canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack all vulnerable opponents with all pokemon that can
  for (const attacker of s.players[pid].playArea) {
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
  const pid: PlayerId = 'ai';

  // Play energy
  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Play trainers (items first)
  for (const card of [...s.players[pid].hand]) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
      }
    }
  }

  // Summon highest-HP pokemon
  const pokemonInHand = s.players[pid].hand
    .filter(c => c.type === 'pokemon')
    .sort((a, b) => (b as PokemonCardDef).hp - (a as PokemonCardDef).hp);
  for (const card of pokemonInHand) {
    if (canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack highest-point target
  const targets = s.players[opponent(pid)].playArea
    .filter(pk => pk.vulnerability === 'vulnerable')
    .sort((a, b) => b.def.pointValue - a.def.pointValue);

  for (const attacker of s.players[pid].playArea) {
    if (attacker.hasAttackedThisTurn || targets.length === 0) continue;
    const target = targets[0];
    // Pick strongest attack affordable
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
  const pid: PlayerId = 'ai';
  const p = s.players[pid];

  // Energy: prioritise playing trainer/non-pokemon from hand to pool
  if (!s.players[pid].energyPlayedThisTurn) {
    const trainerIdx = p.hand.findIndex(c => c.type !== 'pokemon');
    if (trainerIdx >= 0) s = playEnergyFromHand(s, pid, trainerIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  // Use draw items (to improve hand)
  for (const card of [...s.players[pid].hand]) {
    if (card.type === 'item' && canPlayTrainer(s, pid, card.id)) {
      if (['hop', 'great-ball', 'ultra-ball', 'level-ball'].includes(card.id)) {
        s = playTrainer(s, pid, card.id);
        if (s.phase === 'end') return s;
      }
    }
  }

  // Summon: prefer pokemon that complete evolution lines
  const pokemonInHand = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];

  // Summon basics that have evolutions we also have in hand
  for (const card of pokemonInHand) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      const hasEvolution = pokemonInHand.some(c => c.evolvesFrom === card.displayName);
      if (hasEvolution) {
        s = summonPokemon(s, pid, card.id);
      }
    }
  }
  // Summon remaining basics
  for (const card of s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[]) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
    }
  }

  // Attack: prioritise killing targets (overkill by fewer hp remaining = higher priority)
  const targets = s.players[opponent(pid)].playArea
    .filter(pk => pk.vulnerability === 'vulnerable')
    .sort((a, b) => {
      // Sort by (hp remaining / point value) ascending — kill cheapest per point first
      return (a.currentHp / a.def.pointValue) - (b.currentHp / b.def.pointValue);
    });

  for (const attacker of s.players[pid].playArea) {
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

  // Heal if possible
  for (const card of [...s.players[pid].hand]) {
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
