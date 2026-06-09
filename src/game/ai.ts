import type { GameState, PlayerId, PokemonInPlay } from './types';
import type { PokemonCardDef } from './types';
import {
  canSummon, summonPokemon, canAttack, performAttack,
  canPlayTrainer, playTrainer, playEnergyFromHand, playEnergyFromDeck,
  endTurn, opponent, completeDeckSearch,
  canEvolve, evolvePokemon,
} from './engine';

function counterDamage(target: PokemonInPlay): number {
  const dmgAttacks = target.def.attacks.filter(a => a.damage > 0);
  if (dmgAttacks.length === 0) return 0;
  return Math.min(...dmgAttacks.map(a => a.damage));
}

function hasBasicInHand(state: GameState, pid: PlayerId): boolean {
  return state.players[pid].hand.some(
    c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic'
  );
}

function isSuicidal(state: GameState, pid: PlayerId, attacker: PokemonInPlay, attackDmg: number, target: PokemonInPlay): boolean {
  const counter = counterDamage(target);
  if (counter < attacker.currentHp) return false;
  const targetDies = attackDmg >= target.currentHp;
  const p = state.players[pid];
  const otherPokemon = p.playArea.filter(pk => pk.instanceId !== attacker.instanceId);
  if (otherPokemon.length === 0 && !hasBasicInHand(state, pid)) return true;
  if (!targetDies) return true;
  return false;
}

function autoCompleteDeckSearch(state: GameState, pid: PlayerId): GameState {
  if (!state.pendingDeckSearch) return state;
  const first = state.pendingDeckSearch.candidates[0];
  if (!first) return { ...state, pendingDeckSearch: null };
  return completeDeckSearch(state, pid, first.id);
}

// Evolve all eligible Pokémon in play (used by hard/extra-hard)
function evolveAll(state: GameState, pid: PlayerId): GameState {
  let s = state;
  if (s.players[pid].evolutionPlayedThisTurn) return s;
  const areaSnap = [...s.players[pid].playArea];
  for (const pk of areaSnap) {
    const evoCard = s.players[pid].hand.find(
      c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName
    ) as PokemonCardDef | undefined;
    if (evoCard && canEvolve(s, pid, pk.instanceId, evoCard.id)) {
      s = evolvePokemon(s, pid, pk.instanceId, evoCard.id);
      if (s.phase === 'end') return s;
      break; // only one per turn
    }
  }
  return s;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'extra-hard';

// ─── Easy AI ──────────────────────────────────────────────────────────────────

function aiEasy(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

  const handSnapshot = [...s.players[pid].hand];
  for (const card of handSnapshot) {
    if (card.type === 'pokemon' && canSummon(s, pid, card.id)) {
      s = summonPokemon(s, pid, card.id);
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
        const dmg = attacker.def.attacks[i].damage;
        if (isSuicidal(s, pid, attacker, dmg, target)) break;
        s = performAttack(s, pid, attacker.instanceId, i, target.instanceId);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  return endTurn(s);
}

// ─── Medium AI ────────────────────────────────────────────────────────────────

function aiMedium(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const handIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (handIdx >= 0) s = playEnergyFromHand(s, pid, handIdx);
    else s = playEnergyFromDeck(s, pid);
  }

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

  const handSnap2 = s.players[pid].hand
    .filter(c => c.type === 'pokemon')
    .sort((a, b) => (b as PokemonCardDef).hp - (a as PokemonCardDef).hp);
  for (const card of handSnap2) {
    if (canSummon(s, pid, card.id)) s = summonPokemon(s, pid, card.id);
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
      .filter(x => canAttack(s, pid, attacker.instanceId, x.i) && !isSuicidal(s, pid, attacker, x.a.damage, target))
      .sort((x, y) => y.a.damage - x.a.damage)[0];
    if (bestAttack) {
      s = performAttack(s, pid, attacker.instanceId, bestAttack.i, target.instanceId);
      if (s.phase === 'end') return s;
    }
  }

  return endTurn(s);
}

// ─── Hard AI ──────────────────────────────────────────────────────────────────

function aiHard(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;

  if (!s.players[pid].energyPlayedThisTurn) {
    const trainerIdx = s.players[pid].hand.findIndex(c => c.type !== 'pokemon');
    if (trainerIdx >= 0) s = playEnergyFromHand(s, pid, trainerIdx);
    else s = playEnergyFromDeck(s, pid);
  }

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

  s = evolveAll(s, pid);
  if (s.phase === 'end') return s;

  const pokemonInHand = s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  for (const card of [...pokemonInHand]) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) {
      const hasEvolution = pokemonInHand.some(c => c.evolvesFrom === card.displayName);
      if (hasEvolution) s = summonPokemon(s, pid, card.id);
    }
  }
  for (const card of [...(s.players[pid].hand.filter(c => c.type === 'pokemon') as PokemonCardDef[])]) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) s = summonPokemon(s, pid, card.id);
  }

  const targets = s.players[opponent(pid)].playArea
    .filter(pk => pk.vulnerability === 'vulnerable')
    .sort((a, b) => (a.currentHp / a.def.pointValue) - (b.currentHp / b.def.pointValue));

  for (const attacker of [...s.players[pid].playArea]) {
    if (attacker.hasAttackedThisTurn) continue;
    for (const target of targets) {
      const best = attacker.def.attacks
        .map((a, i) => ({ a, i }))
        .filter(x => canAttack(s, pid, attacker.instanceId, x.i) && !isSuicidal(s, pid, attacker, x.a.damage, target))
        .sort((x, y) => y.a.damage - x.a.damage)[0];
      if (best) {
        s = performAttack(s, pid, attacker.instanceId, best.i, target.instanceId);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  // Boss's Orders before next turn
  for (const card of [...s.players[pid].hand]) {
    if (card.id === 'bosss-orders' && canPlayTrainer(s, pid, card.id)) {
      const readyTarget = s.players[opponent(pid)].playArea
        .filter(pk => pk.vulnerability === 'ready')
        .sort((a, b) => b.def.pointValue - a.def.pointValue)[0];
      if (readyTarget) {
        s = playTrainer(s, pid, card.id, readyTarget.instanceId);
        if (s.phase === 'end') return s;
      }
    }
  }

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

// ─── Extra-Hard AI: active multi-step strategic planning ──────────────────────

function aiExtraHard(state: GameState): GameState {
  let s = state;
  const pid: PlayerId = state.currentPlayer;
  const me = () => s.players[pid];
  const opp = () => s.players[opponent(pid)];

  // Helper: would this attack kill the target?
  const kills = (dmg: number, target: PokemonInPlay) => dmg >= target.currentHp;

  // Helper: would this kill win the game?
  const winsGame = (target: PokemonInPlay) => me().points + target.def.pointValue >= 10;

  // Helper: best affordable non-suicidal attack for attacker vs target
  function bestSafeAttack(attacker: PokemonInPlay, target: PokemonInPlay) {
    return attacker.def.attacks
      .map((a, i) => ({ a, i }))
      .filter(x => canAttack(s, pid, attacker.instanceId, x.i) && !isSuicidal(s, pid, attacker, x.a.damage, target))
      .sort((x, y) => y.a.damage - x.a.damage)[0];
  }

  // Helper: best affordable attack regardless of suicidal (for game-winning plays)
  function bestAttack(attacker: PokemonInPlay, _target: PokemonInPlay) {
    return attacker.def.attacks
      .map((a, i) => ({ a, i }))
      .filter(x => canAttack(s, pid, attacker.instanceId, x.i))
      .sort((x, y) => y.a.damage - x.a.damage)[0];
  }

  // ── PHASE 1: Draw supporters early to maximise options ──────────────────────
  if (!me().supporterPlayedThisTurn) {
    const suppCards = me().hand.filter(c => c.type === 'supporter');
    for (const card of suppCards) {
      if (!canPlayTrainer(s, pid, card.id)) continue;
      // Professor's Research: use if hand ≤ 4 or deck is big
      if (card.id === 'professors-research' && me().hand.length <= 5) {
        s = playTrainer(s, pid, card.id);
        if (s.phase === 'end') return s;
        break;
      }
      // Iono: disrupt opponent when they have ≥ 5 cards
      if (card.id === 'iono' && opp().hand.length >= 5 && me().hand.length >= 4) {
        s = playTrainer(s, pid, card.id);
        if (s.phase === 'end') return s;
        break;
      }
      // Cynthia: free shuffle+draw, always good
      if (card.id === 'cynthia') {
        s = playTrainer(s, pid, card.id);
        if (s.phase === 'end') return s;
        break;
      }
      // Hop: only if hand very low
      if (card.id === 'hop' && me().hand.length <= 2) {
        s = playTrainer(s, pid, card.id);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  // ── PHASE 2: Draw/search items ───────────────────────────────────────────────
  for (const card of [...me().hand]) {
    if (card.type !== 'item' || !canPlayTrainer(s, pid, card.id)) continue;
    if (['ultra-ball', 'great-ball', 'level-ball', 'hop'].includes(card.id)) {
      s = playTrainer(s, pid, card.id);
      s = autoCompleteDeckSearch(s, pid);
      if (s.phase === 'end') return s;
    }
  }

  // ── PHASE 3: Play energy ─────────────────────────────────────────────────────
  if (!me().energyPlayedThisTurn) {
    // Prefer non-pokemon from hand; fall back to deck
    const idx = me().hand.findIndex(c => c.type !== 'pokemon');
    if (idx >= 0) s = playEnergyFromHand(s, pid, idx);
    else s = playEnergyFromDeck(s, pid);
  }

  // ── PHASE 4: Evolve ──────────────────────────────────────────────────────────
  s = evolveAll(s, pid);
  if (s.phase === 'end') return s;

  // Use Rare Candy to rush evolution
  if (!s.pendingDeckSearch) {
    for (const card of [...me().hand]) {
      if (card.id === 'rare-candy' && canPlayTrainer(s, pid, card.id)) {
        // Find a basic in play that has an evolution in deck
        const basicWithDeckEvo = me().playArea.find(pk =>
          me().deckCards.some(c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === pk.def.displayName)
        );
        if (basicWithDeckEvo) {
          s = playTrainer(s, pid, card.id, basicWithDeckEvo.instanceId);
          s = autoCompleteDeckSearch(s, pid);
          if (s.phase === 'end') return s;
          break;
        }
      }
    }
  }

  // ── PHASE 5: Summon — prefer basics with evolutions, fill bench ──────────────
  const pokInHand = me().hand.filter(c => c.type === 'pokemon') as PokemonCardDef[];
  // First: basics that have evolution lines
  for (const card of [...pokInHand]) {
    if (card.stage !== 'Basic' || !canSummon(s, pid, card.id)) continue;
    const hasEvo = pokInHand.some(c => c.evolvesFrom === card.displayName)
      || me().deckCards.some(c => c.type === 'pokemon' && (c as PokemonCardDef).evolvesFrom === card.displayName);
    if (hasEvo) s = summonPokemon(s, pid, card.id);
  }
  // Then fill remaining slots
  for (const card of [...(me().hand.filter(c => c.type === 'pokemon') as PokemonCardDef[])]) {
    if (card.stage === 'Basic' && canSummon(s, pid, card.id)) s = summonPokemon(s, pid, card.id);
  }

  // ── PHASE 6: Game-winning attacks — override suicidal check ─────────────────
  for (const attacker of [...me().playArea]) {
    if (attacker.hasAttackedThisTurn) continue;
    for (const target of opp().playArea.filter(pk => pk.vulnerability === 'vulnerable')) {
      const best = bestAttack(attacker, target);
      if (best && kills(best.a.damage, target) && winsGame(target)) {
        s = performAttack(s, pid, attacker.instanceId, best.i, target.instanceId);
        return s;
      }
    }
  }

  // ── PHASE 7: Boss's Orders + kill combo ──────────────────────────────────────
  // If Boss's Orders exposes a target we can kill this very turn, use it now
  if (!me().supporterPlayedThisTurn) {
    for (const card of me().hand) {
      if (card.id !== 'bosss-orders' || !canPlayTrainer(s, pid, card.id)) continue;
      const readyTargets = opp().playArea.filter(pk => pk.vulnerability === 'ready');
      for (const readyTarget of readyTargets.sort((a, b) => b.def.pointValue - a.def.pointValue)) {
        const canKillAfterBoss = me().playArea.some(attacker => {
          if (attacker.hasAttackedThisTurn) return false;
          return attacker.def.attacks.some((a, i) =>
            canAttack(s, pid, attacker.instanceId, i) && kills(a.damage, readyTarget)
          );
        });
        if (canKillAfterBoss) {
          s = playTrainer(s, pid, card.id, readyTarget.instanceId);
          if (s.phase === 'end') return s;
          break;
        }
      }
    }
  }

  // ── PHASE 8: Kill shots — prioritise KO by points won ───────────────────────
  for (const attacker of [...me().playArea]) {
    if (attacker.hasAttackedThisTurn) continue;
    const killTargets = opp().playArea
      .filter(pk => pk.vulnerability === 'vulnerable')
      .filter(target => {
        const b = bestAttack(attacker, target);
        return b && kills(b.a.damage, target);
      })
      .sort((a, b) => b.def.pointValue - a.def.pointValue);

    if (killTargets.length > 0) {
      const target = killTargets[0];
      const best = bestAttack(attacker, target)!;
      // Accept mutual kills only if we have a replacement
      const counter = counterDamage(target);
      const attackerDies = counter >= attacker.currentHp;
      const others = me().playArea.filter(pk => pk.instanceId !== attacker.instanceId);
      if (!attackerDies || others.length > 0 || hasBasicInHand(s, pid)) {
        s = performAttack(s, pid, attacker.instanceId, best.i, target.instanceId);
        if (s.phase === 'end') return s;
      }
    }
  }

  // ── PHASE 9: Damage accumulation — chip down the weakest target ──────────────
  for (const attacker of [...me().playArea]) {
    if (attacker.hasAttackedThisTurn) continue;
    // Sort: most damaged relative to HP (closest to dying) and highest point value
    const vulnTargets = opp().playArea
      .filter(pk => pk.vulnerability === 'vulnerable')
      .sort((a, b) => {
        const scoreA = (1 - a.currentHp / a.def.hp) * a.def.pointValue;
        const scoreB = (1 - b.currentHp / b.def.hp) * b.def.pointValue;
        return scoreB - scoreA;
      });
    for (const target of vulnTargets) {
      const best = bestSafeAttack(attacker, target);
      if (best) {
        s = performAttack(s, pid, attacker.instanceId, best.i, target.instanceId);
        if (s.phase === 'end') return s;
        break;
      }
    }
  }

  // ── PHASE 10: Boss's Orders on highest-value ready target ────────────────────
  if (!me().supporterPlayedThisTurn) {
    for (const card of me().hand) {
      if (card.id === 'bosss-orders' && canPlayTrainer(s, pid, card.id)) {
        const readyTarget = opp().playArea
          .filter(pk => pk.vulnerability === 'ready')
          .sort((a, b) => b.def.pointValue - a.def.pointValue)[0];
        if (readyTarget) {
          s = playTrainer(s, pid, card.id, readyTarget.instanceId);
          if (s.phase === 'end') return s;
        }
      }
    }
  }

  // ── PHASE 11: Heal high-value wounded Pokémon ────────────────────────────────
  for (const card of [...me().hand]) {
    if ((card.id === 'potion' || card.id === 'super-potion') && canPlayTrainer(s, pid, card.id)) {
      const heal = card.id === 'super-potion' ? 80 : 30; void heal;
      // Prioritise: highest point-value Pokémon that would die from a counter
      const endangered = me().playArea
        .filter(pk => {
          const maxCounter = Math.max(0, ...opp().playArea.map(counterDamage));
          return pk.currentHp <= maxCounter && pk.currentHp < pk.def.hp;
        })
        .sort((a, b) => b.def.pointValue - a.def.pointValue)[0]
        // Fall back to most damaged high-value
        ?? me().playArea
          .filter(pk => pk.currentHp < pk.def.hp * 0.55)
          .sort((a, b) => b.def.pointValue * (1 - b.currentHp / b.def.hp) - a.def.pointValue * (1 - a.currentHp / a.def.hp))[0];

      if (endangered) {
        s = playTrainer(s, pid, card.id, endangered.instanceId);
        if (s.phase === 'end') return s;
      }
    }
  }

  // ── PHASE 12: Switch — retreat a Pokémon that will die from any counter ──────
  for (const card of [...me().hand]) {
    if (card.id === 'switch' && canPlayTrainer(s, pid, card.id)) {
      const maxCounter = Math.max(0, ...opp().playArea.map(counterDamage));
      const doomed = me().playArea
        .filter(pk => pk.currentHp <= maxCounter && me().playArea.length > 1)
        .sort((a, b) => b.def.pointValue - a.def.pointValue)[0];
      const replacement = me().hand.find(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic');
      if (doomed && replacement) {
        s = playTrainer(s, pid, card.id, doomed.instanceId);
        if (s.phase === 'end') return s;
        if (s.pendingFreeSummon) {
          s = summonPokemon(s, pid, replacement.id);
        }
        break;
      }
    }
  }

  return endTurn(s);
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function runAITurn(state: GameState, difficulty: AIDifficulty): GameState {
  switch (difficulty) {
    case 'easy':       return aiEasy(state);
    case 'medium':     return aiMedium(state);
    case 'hard':       return aiHard(state);
    case 'extra-hard': return aiExtraHard(state);
  }
}
