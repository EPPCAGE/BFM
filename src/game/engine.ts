import type {
  GameState, PlayerState, PlayerId, PokemonInPlay, EnergyCard,
  PokemonCardDef, TrainerCardDef, LogEntry, Attack,
} from './types';
import { getCardById } from '../data/cards';

// ─── Utilities ─────────────────────────────────────────────────────────────────

let instanceCounter = 0;
export function newId(): string {
  return `inst_${++instanceCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(state: GameState, player: PlayerId, message: string): GameState {
  const entry: LogEntry = { id: newId(), turn: state.turn, player, message };
  return { ...state, log: [...state.log, entry] };
}

export function opponent(id: PlayerId): PlayerId {
  return id === 'player' ? 'ai' : 'player';
}

// ─── Initialisation ────────────────────────────────────────────────────────────

export function buildPlayer(id: PlayerId, cardIds: string[]): PlayerState {
  // Mulligan: redraw up to 3 times if opening hand has no Basic Pokémon
  let deck = shuffle(cardIds.map(cid => getCardById(cid)!).filter(Boolean));
  let hand: typeof deck = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    hand = deck.slice(0, 7);
    const hasBasic = hand.some(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic');
    if (hasBasic) break;
    deck = shuffle(deck); // reshuffle and retry
  }
  deck = deck.slice(7);
  return {
    id,
    deckCards: deck,
    hand,
    discardPile: [],
    energyPool: [],
    playArea: [],
    points: 0,
    supporterPlayedThisTurn: false,
    energyPlayedThisTurn: false,
    evolutionPlayedThisTurn: false,
  };
}

export function initGame(playerDeckIds: string[], aiDeckIds: string[]): GameState {
  const state: GameState = {
    turn: 1,
    currentPlayer: 'player',
    phase: 'main',
    players: {
      player: buildPlayer('player', playerDeckIds),
      ai: buildPlayer('ai', aiDeckIds),
    },
    log: [],
    result: null,
    selectedHandCard: null,
    selectedPlayAreaTarget: null,
    pendingAction: null,
    pendingDeckSearch: null,
    pendingFreeSummon: false,
    aiThinking: false,
  };
  return log(state, 'player', 'Jogo iniciado! Turno 1 — Sua vez.');
}

// ─── Draw ──────────────────────────────────────────────────────────────────────

export function drawCard(state: GameState, pid: PlayerId, count = 1): GameState {
  let s = state;
  const p = s.players[pid];
  if (p.deckCards.length === 0) {
    s = log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} não tem mais cartas! Derrota por deck out.`);
    return { ...s, result: pid === 'player' ? 'ai_wins' : 'player_wins', phase: 'end' };
  }
  // Draw only as many cards as available (partial draw is allowed; only 0 cards triggers deck out)
  const actualCount = Math.min(count, p.deckCards.length);
  const drawn = p.deckCards.slice(0, actualCount);
  const newDeck = p.deckCards.slice(actualCount);
  const newHand = [...p.hand, ...drawn];
  s = { ...s, players: { ...s.players, [pid]: { ...p, deckCards: newDeck, hand: newHand } } };
  return s;
}

// ─── Energy Pool ───────────────────────────────────────────────────────────────

export function canPlayEnergy(state: GameState, pid: PlayerId): boolean {
  return !state.players[pid].energyPlayedThisTurn;
}

export function playEnergyFromHand(state: GameState, pid: PlayerId, cardIndex: number): GameState {
  let s = state;
  const p = s.players[pid];
  if (!canPlayEnergy(s, pid)) return s;
  if (cardIndex < 0 || cardIndex >= p.hand.length) return s;

  const card = p.hand[cardIndex];
  const newHand = p.hand.filter((_, i) => i !== cardIndex);
  const energyCard: EnergyCard = { instanceId: newId(), cardId: card.id, def: card, used: false };
  const newPool = [...p.energyPool, energyCard];

  s = {
    ...s,
    players: {
      ...s.players,
      [pid]: { ...p, hand: newHand, energyPool: newPool, energyPlayedThisTurn: true },
    },
  };
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} adicionou${pid === 'player' ? ` "${card.displayName}"` : ' uma carta'} ao Energy Pool.`);
}

export function playEnergyFromDeck(state: GameState, pid: PlayerId): GameState {
  let s = state;
  const p = s.players[pid];
  if (!canPlayEnergy(s, pid)) return s;
  if (p.deckCards.length === 0) return s;

  const [card, ...rest] = p.deckCards;
  const energyCard: EnergyCard = { instanceId: newId(), cardId: card.id, def: card, used: false };
  s = {
    ...s,
    players: {
      ...s.players,
      [pid]: { ...p, deckCards: rest, energyPool: [...p.energyPool, energyCard], energyPlayedThisTurn: true },
    },
  };
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} adicionou o topo do deck ao Energy Pool.`);
}

export function playEnergyFromDiscard(state: GameState, pid: PlayerId): GameState {
  let s = state;
  const p = s.players[pid];
  if (!canPlayEnergy(s, pid)) return s;
  if (p.discardPile.length === 0) return s;

  const card = p.discardPile[p.discardPile.length - 1];
  const newDiscard = p.discardPile.slice(0, -1);
  const energyCard: EnergyCard = { instanceId: newId(), cardId: card.id, def: card, used: false };
  s = {
    ...s,
    players: {
      ...s.players,
      [pid]: { ...p, discardPile: newDiscard, energyPool: [...p.energyPool, energyCard], energyPlayedThisTurn: true },
    },
  };
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} adicionou o topo do descarte ao Energy Pool.`);
}

export function availableEnergy(p: PlayerState): number {
  return p.energyPool.filter(e => !e.used).length;
}

export function spendEnergy(state: GameState, pid: PlayerId, amount: number): GameState {
  const p = state.players[pid];
  let spent = 0;
  const newPool = p.energyPool.map(e => {
    if (!e.used && spent < amount) { spent++; return { ...e, used: true }; }
    return e;
  });
  return { ...state, players: { ...state.players, [pid]: { ...p, energyPool: newPool } } };
}

// ─── Summoning ─────────────────────────────────────────────────────────────────

export function canSummon(state: GameState, pid: PlayerId, cardId: string): boolean {
  const p = state.players[pid];
  if (p.playArea.length >= 5) return false;
  const def = getCardById(cardId) as PokemonCardDef;
  if (!def || def.type !== 'pokemon') return false;
  if (def.stage !== 'Basic') return false;
  if (!state.pendingFreeSummon && availableEnergy(p) < def.retreatCost) return false;
  return true;
}

export function summonPokemon(state: GameState, pid: PlayerId, cardId: string): GameState {
  let s = state;
  const p = s.players[pid];
  const def = getCardById(cardId) as PokemonCardDef;
  if (!canSummon(s, pid, cardId)) return s;

  const handIdx = p.hand.findIndex(c => c.id === cardId);
  if (handIdx === -1) return s;

  const instance: PokemonInPlay = {
    instanceId: newId(),
    cardId,
    def,
    currentHp: def.hp,
    vulnerability: 'vulnerable',
    hasAttackedThisTurn: false,
    hasUsedAbilityThisTurn: false,
    turnsInPlay: 0,
    evolutionStack: [def],
  };

  const newHand = p.hand.filter((_, i) => i !== handIdx);
  const free = s.pendingFreeSummon;
  s = {
    ...s,
    pendingFreeSummon: false,
    players: {
      ...s.players,
      [pid]: { ...p, hand: newHand, playArea: [...p.playArea, instance] },
    },
  };
  if (!free) s = spendEnergy(s, pid, def.retreatCost);
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} invocou ${def.displayName}${free ? ' (grátis via Switch)' : ` (evocar: ${def.retreatCost})`}.`);
}

// ─── Evolution ─────────────────────────────────────────────────────────────────

export function checkExhaustion(state: GameState, pid: PlayerId): GameState {
  const p = state.players[pid];
  if (
    p.playArea.length === 0 &&
    p.hand.filter(c => c.type === 'pokemon').length === 0 &&
    p.deckCards.filter(c => c.type === 'pokemon').length === 0
  ) {
    const s = log(state, pid, `${pid === 'player' ? 'Você' : 'IA'} não tem mais Pokémon. Derrota por exaustão!`);
    return { ...s, result: pid === 'player' ? 'ai_wins' : 'player_wins', phase: 'end' };
  }
  return state;
}

export function canEvolve(
  state: GameState, pid: PlayerId,
  targetInstanceId: string, evolvedCardId: string, rareCandy = false
): boolean {
  const p = state.players[pid];
  const target = p.playArea.find(pk => pk.instanceId === targetInstanceId);
  const evoDef = getCardById(evolvedCardId) as PokemonCardDef;
  if (!target || !evoDef || evoDef.type !== 'pokemon') return false;
  if (evoDef.evolvesFrom !== target.def.displayName) return false;
  if (!rareCandy && target.turnsInPlay < 1) return false;
  if (availableEnergy(p) < evoDef.retreatCost) return false;
  if (p.evolutionPlayedThisTurn) return false;
  return true;
}

export function evolvePokemon(
  state: GameState, pid: PlayerId,
  targetInstanceId: string, evolvedCardId: string, rareCandy = false
): GameState {
  let s = state;
  const p = s.players[pid];
  const evoDef = getCardById(evolvedCardId) as PokemonCardDef;
  if (!canEvolve(s, pid, targetInstanceId, evolvedCardId, rareCandy)) return s;

  const handIdx = p.hand.findIndex(c => c.id === evolvedCardId);
  if (handIdx === -1) return s;

  const newHand = p.hand.filter((_, i) => i !== handIdx);
  const newArea = p.playArea.map(pk => {
    if (pk.instanceId !== targetInstanceId) return pk;
    const damageTaken = pk.def.hp - pk.currentHp;
    return {
      ...pk,
      cardId: evoDef.id,
      def: evoDef,
      currentHp: Math.max(1, evoDef.hp - damageTaken), // preserve damage, minimum 1 HP
      hasAttackedThisTurn: false, // evolution resets attack for the new form
      evolutionStack: [...pk.evolutionStack, evoDef],
    };
  });

  s = { ...s, players: { ...s.players, [pid]: { ...p, hand: newHand, playArea: newArea, evolutionPlayedThisTurn: true } } };
  s = spendEnergy(s, pid, evoDef.retreatCost);
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} evoluiu para ${evoDef.displayName}.`);
}

// ─── Combat ────────────────────────────────────────────────────────────────────

export function canAttack(
  state: GameState, pid: PlayerId,
  attackerInstanceId: string, attackIndex: number
): boolean {
  const p = state.players[pid];
  const attacker = p.playArea.find(pk => pk.instanceId === attackerInstanceId);
  if (!attacker) return false;
  if (attacker.hasAttackedThisTurn) return false;
  const attack = attacker.def.attacks[attackIndex];
  if (!attack) return false;
  if (availableEnergy(p) < attack.cost) return false;
  // target must exist and be vulnerable
  const opp = state.players[opponent(pid)];
  return opp.playArea.some(pk => pk.vulnerability === 'vulnerable');
}

export function getLowestPositiveDamageAttack(def: PokemonCardDef): { attack: Attack; index: number } | null {
  const candidates = def.attacks
    .map((a, i) => ({ attack: a, index: i }))
    .filter(x => x.attack.damage > 0)
    .sort((a, b) => a.attack.damage - b.attack.damage);
  return candidates[0] ?? null;
}

// Perform a 0-damage ability-attack (no target, no counterattack, no vulnerability)
export function performAbilityAttack(
  state: GameState, pid: PlayerId,
  attackerInstanceId: string, attackIndex: number,
  handIndex?: number  // for teleport
): GameState {
  let s = state;
  const p = s.players[pid];
  const attacker = p.playArea.find(pk => pk.instanceId === attackerInstanceId);
  if (!attacker) return s;

  const attack = attacker.def.attacks[attackIndex];
  if (!attack || attack.damage !== 0 || !attack.effectType) return s;
  if (availableEnergy(p) < attack.cost) return s;

  s = spendEnergy(s, pid, attack.cost);
  // Mark as VULNERABLE + hasAttackedThisTurn (like real attacks), but no counterattack
  const newAttacker = { ...attacker, vulnerability: 'vulnerable' as const, hasAttackedThisTurn: true };
  s = { ...s, players: { ...s.players, [pid]: { ...s.players[pid], playArea: s.players[pid].playArea.map(pk => pk.instanceId === attackerInstanceId ? newAttacker : pk) } } };
  s = log(s, pid, `${attacker.def.displayName} usou ${attack.name}!`);

  switch (attack.effectType) {
    case 'draw3': {
      s = drawCard(s, pid);
      s = drawCard(s, pid);
      s = drawCard(s, pid);
      break;
    }
    case 'shield30': {
      s = { ...s, players: { ...s.players, [pid]: { ...s.players[pid], playArea: s.players[pid].playArea.map(pk => pk.instanceId === attackerInstanceId ? { ...pk, vulnerability: 'vulnerable' as const, hasAttackedThisTurn: true, damageReduction: 30 } : pk) } } };
      break;
    }
    case 'weaken-attacker': {
      s = { ...s, players: { ...s.players, [pid]: { ...s.players[pid], playArea: s.players[pid].playArea.map(pk => pk.instanceId === attackerInstanceId ? { ...pk, vulnerability: 'vulnerable' as const, hasAttackedThisTurn: true, weakenAttacker: 20 } : pk) } } };
      break;
    }
    case 'teleport': {
      if (handIndex === undefined) break;
      const hand = s.players[pid].hand;
      const handCard = hand[handIndex];
      if (!handCard || handCard.type !== 'pokemon') break;
      const newHandCard = handCard as import('./types').PokemonCardDef;
      if (newHandCard.stage !== 'Basic') break;
      // Swap: put Abra back in hand, put hand Pokémon into play (ready)
      const newHand = hand.map((c, i) => i === handIndex ? attacker.def : c);
      const newInstanceId = `${newHandCard.id}-${Date.now()}`;
      const newPokemon: import('./types').PokemonInPlay = {
        instanceId: newInstanceId, cardId: newHandCard.id, def: newHandCard,
        currentHp: newHandCard.hp, vulnerability: 'ready', hasAttackedThisTurn: false,
        hasUsedAbilityThisTurn: false, turnsInPlay: 0, evolutionStack: [newHandCard],
      };
      const newArea = s.players[pid].playArea.map(pk => pk.instanceId === attackerInstanceId ? newPokemon : pk);
      s = { ...s, players: { ...s.players, [pid]: { ...s.players[pid], hand: newHand, playArea: newArea } } };
      s = log(s, pid, `${attacker.def.displayName} voltou para a mão e ${newHandCard.displayName} entrou em jogo!`);
      break;
    }
  }
  return s;
}

export function performAttack(
  state: GameState, pid: PlayerId,
  attackerInstanceId: string, attackIndex: number,
  targetInstanceId: string
): GameState {
  let s = state;
  const p = s.players[pid];
  const opp = s.players[opponent(pid)];
  const attacker = p.playArea.find(pk => pk.instanceId === attackerInstanceId);
  const target = opp.playArea.find(pk => pk.instanceId === targetInstanceId);

  if (!attacker || !target) return s;
  if (target.vulnerability !== 'vulnerable') {
    return log(s, pid, `${target.def.displayName} não está vulnerável e não pode ser atacado.`);
  }

  const attack = attacker.def.attacks[attackIndex];
  if (!attack) return s;
  // 0-damage attacks are ability-attacks, not real attacks — use performAbilityAttack
  if (attack.damage === 0) return s;
  if (availableEnergy(p) < attack.cost) return s;

  // Pay cost
  s = spendEnergy(s, pid, attack.cost);

  // Apply damage (reduced by target's weakenAttacker debuff or shield)
  const rawDamage = attack.damage;
  const weakenPenalty = target.weakenAttacker ?? 0;
  const damage = Math.max(0, rawDamage - weakenPenalty);
  const shieldedTarget = { ...target, weakenAttacker: undefined };
  const newTargetHp = Math.max(0, shieldedTarget.currentHp - Math.max(0, damage - (shieldedTarget.damageReduction ?? 0)));

  // Mark attacker as vulnerable and attacked
  const newAttacker = { ...attacker, vulnerability: 'vulnerable' as const, hasAttackedThisTurn: true };

  // Simultaneous counterattack — calculated before applying any results
  const counterData = getLowestPositiveDamageAttack(shieldedTarget.def);
  const counterDmg = counterData ? counterData.attack.damage : 0;
  const newAttackerHp = Math.max(0, newAttacker.currentHp - counterDmg);

  s = log(s, pid,
    `${attacker.def.displayName} usou ${attack.name} em ${target.def.displayName} causando ${damage} de dano!`
  );
  if (counterData) {
    s = log(s, opponent(pid),
      `${target.def.displayName} contra-atacou simultaneamente com ${counterData.attack.name} causando ${counterDmg} de dano!`
    );
  }

  // Apply attacker fate (did counter kill it?)
  const attackerFainted = newAttackerHp <= 0;
  const targetFainted = newTargetHp <= 0;

  // Build updated areas
  let newPlayerArea2 = s.players[pid].playArea.map(pk =>
    pk.instanceId === attackerInstanceId
      ? { ...newAttacker, currentHp: newAttackerHp }
      : pk
  );
  let newOppArea = targetFainted
    ? opp.playArea.filter(pk => pk.instanceId !== targetInstanceId)
    : opp.playArea.map(pk =>
        pk.instanceId === targetInstanceId
          ? { ...target, currentHp: newTargetHp, damageReduction: undefined, weakenAttacker: undefined }
          : pk
      );
  if (attackerFainted) {
    newPlayerArea2 = newPlayerArea2.filter(pk => pk.instanceId !== attackerInstanceId);
  }

  let playerPoints = s.players[pid].points;
  let oppPoints = s.players[opponent(pid)].points;
  const playerDiscard = [...s.players[pid].discardPile];
  const oppDiscard = [...opp.discardPile];

  if (targetFainted) {
    playerPoints += target.def.pointValue;
    oppDiscard.push(target.def);
    s = log(s, pid, `${target.def.displayName} foi derrotado! +${target.def.pointValue} ponto(s). Total: ${playerPoints}/10`);
  }
  if (attackerFainted) {
    oppPoints += attacker.def.pointValue;
    playerDiscard.push(attacker.def);
    s = log(s, opponent(pid), `${attacker.def.displayName} foi derrotado pelo contra-ataque! +${attacker.def.pointValue} ponto(s). Total: ${oppPoints}/10`);
  }

  s = {
    ...s,
    players: {
      ...s.players,
      [pid]: { ...s.players[pid], playArea: newPlayerArea2, points: playerPoints, discardPile: playerDiscard },
      [opponent(pid)]: { ...opp, playArea: newOppArea, points: oppPoints, discardPile: oppDiscard },
    },
  };

  // Check win conditions (target kill wins first, then counter)
  if (playerPoints >= 10) {
    s = log(s, pid, `${pid === 'player' ? 'Você ganhou' : 'IA ganhou'}! 10 pontos atingidos.`);
    return { ...s, result: pid === 'player' ? 'player_wins' : 'ai_wins', phase: 'end' };
  }
  if (oppPoints >= 10) {
    s = log(s, opponent(pid), `${opponent(pid) === 'player' ? 'Você ganhou' : 'IA ganhou'}! 10 pontos atingidos.`);
    return { ...s, result: opponent(pid) === 'player' ? 'player_wins' : 'ai_wins', phase: 'end' };
  }

  // Exhaustion checks
  const oppAfter = s.players[opponent(pid)];
  if (oppAfter.playArea.length === 0 && oppAfter.hand.filter(c => c.type === 'pokemon').length === 0 && oppAfter.deckCards.filter(c => c.type === 'pokemon').length === 0) {
    s = log(s, opponent(pid), 'Não há Pokémon disponíveis. Derrota por exaustão!');
    return { ...s, result: pid === 'player' ? 'player_wins' : 'ai_wins', phase: 'end' };
  }
  const playerAfter = s.players[pid];
  if (playerAfter.playArea.length === 0 && playerAfter.hand.filter(c => c.type === 'pokemon').length === 0 && playerAfter.deckCards.filter(c => c.type === 'pokemon').length === 0) {
    s = log(s, pid, 'Não há Pokémon disponíveis. Derrota por exaustão!');
    return { ...s, result: opponent(pid) === 'player' ? 'player_wins' : 'ai_wins', phase: 'end' };
  }

  return s;
}

// ─── Trainer Cards ─────────────────────────────────────────────────────────────

export function canPlayTrainer(state: GameState, pid: PlayerId, cardId: string): boolean {
  const p = state.players[pid];
  const def = getCardById(cardId) as TrainerCardDef;
  if (!def || def.type !== 'item' && def.type !== 'supporter') return false;
  if (def.type === 'supporter' && p.supporterPlayedThisTurn) return false;
  if (availableEnergy(p) < def.cost) return false;
  return true;
}

export function playTrainer(
  state: GameState, pid: PlayerId, cardId: string,
  targetInstanceId?: string
): GameState {
  let s = state;
  const p = s.players[pid];
  const def = getCardById(cardId) as TrainerCardDef;
  if (!canPlayTrainer(s, pid, cardId)) return s;

  const handIdx = p.hand.findIndex(c => c.id === cardId);
  if (handIdx === -1) return s;

  // Remove from hand, pay cost
  const newHand = p.hand.filter((_, i) => i !== handIdx);
  s = { ...s, players: { ...s.players, [pid]: { ...p, hand: newHand } } };
  s = spendEnergy(s, pid, def.cost);
  if (def.type === 'supporter') {
    s = { ...s, players: { ...s.players, [pid]: { ...s.players[pid], supporterPlayedThisTurn: true } } };
  }

  // Apply effect
  s = applyTrainerEffect(s, pid, def, targetInstanceId);

  // Discard trainer
  const pp = s.players[pid];
  s = { ...s, players: { ...s.players, [pid]: { ...pp, discardPile: [...pp.discardPile, def] } } };
  return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} jogou ${def.displayName}.`);
}

function applyTrainerEffect(
  state: GameState, pid: PlayerId, def: TrainerCardDef,
  targetInstanceId?: string
): GameState {
  let s = state;
  const p = () => s.players[pid];
  const opp = () => s.players[opponent(pid)];

  switch (def.id) {
    case 'ultra-ball': {
      const candidates = p().deckCards.filter(c => c.type === 'pokemon');
      if (candidates.length > 0) {
        s = { ...s, pendingDeckSearch: { trainerCardId: def.id, candidates, action: 'add-to-hand' } };
      }
      break;
    }
    case 'nest-ball': {
      const candidates = p().deckCards.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic');
      if (candidates.length > 0 && p().playArea.length < 5) {
        s = { ...s, pendingDeckSearch: { trainerCardId: def.id, candidates, action: 'put-in-play' } };
      }
      break;
    }
    case 'great-ball': {
      const candidates = p().deckCards.slice(0, 7).filter(c => c.type === 'pokemon');
      if (candidates.length > 0) {
        s = { ...s, pendingDeckSearch: { trainerCardId: def.id, candidates, action: 'add-to-hand' } };
      }
      break;
    }
    case 'level-ball': {
      const candidates = p().deckCards.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).hp <= 90);
      if (candidates.length > 0) {
        s = { ...s, pendingDeckSearch: { trainerCardId: def.id, candidates, action: 'add-to-hand' } };
      }
      break;
    }
    case 'potion': {
      if (targetInstanceId) {
        const newArea = p().playArea.map(pk => {
          if (pk.instanceId !== targetInstanceId) return pk;
          return { ...pk, currentHp: Math.min(pk.def.hp, pk.currentHp + 30) };
        });
        s = { ...s, players: { ...s.players, [pid]: { ...p(), playArea: newArea } } };
      }
      break;
    }
    case 'super-potion': {
      if (targetInstanceId) {
        const newArea = p().playArea.map(pk => {
          if (pk.instanceId !== targetInstanceId) return pk;
          return { ...pk, currentHp: Math.min(pk.def.hp, pk.currentHp + 80) };
        });
        s = { ...s, players: { ...s.players, [pid]: { ...p(), playArea: newArea } } };
      }
      break;
    }
    case 'switch': {
      if (targetInstanceId) {
        const target = p().playArea.find(pk => pk.instanceId === targetInstanceId);
        if (target) {
          const newArea = p().playArea.filter(pk => pk.instanceId !== targetInstanceId);
          // Return entire evolution stack to hand
          const allCards = target.evolutionStack as import('./types').CardDef[];
          s = {
            ...s,
            pendingFreeSummon: true,
            players: {
              ...s.players,
              [pid]: {
                ...p(),
                playArea: newArea,
                hand: [...p().hand, ...allCards],
              },
            },
          };
        }
      }
      break;
    }
    case 'bosss-orders': {
      if (targetInstanceId) {
        const target = opp().playArea.find(pk => pk.instanceId === targetInstanceId);
        if (target && target.vulnerability === 'ready') {
          const newOppArea = opp().playArea.map(pk =>
            pk.instanceId === targetInstanceId ? { ...pk, vulnerability: 'vulnerable' as const } : pk
          );
          s = { ...s, players: { ...s.players, [opponent(pid)]: { ...opp(), playArea: newOppArea } } };
          s = log(s, pid, `${target.def.displayName} foi forçado a ficar vulnerável!`);
        }
      }
      break;
    }
    case 'ordinary-rod':
    case 'super-rod': {
      // Return up to 2/3 Pokémon from discard to deck
      const count = def.id === 'super-rod' ? 3 : 2;
      const pkFromDiscard = p().discardPile.filter(c => c.type === 'pokemon').slice(0, count) as PokemonCardDef[];
      let taken = 0;
      const newDiscard = p().discardPile.filter(c => {
        if (c.type === 'pokemon' && taken < count) { taken++; return false; }
        return true;
      });
      const newDeck = shuffle([...p().deckCards, ...pkFromDiscard]);
      s = { ...s, players: { ...s.players, [pid]: { ...p(), deckCards: newDeck, discardPile: newDiscard } } };
      break;
    }
    case 'professors-research': {
      // Discard current hand, draw 7 from deck
      const discardedHand = p().hand;
      const newDiscard = [...p().discardPile, ...discardedHand];
      const deckCopy = [...p().deckCards];
      const drawn = deckCopy.splice(0, Math.min(7, deckCopy.length));
      s = { ...s, players: { ...s.players, [pid]: { ...p(), deckCards: deckCopy, hand: drawn, discardPile: newDiscard } } };
      break;
    }
    case 'cynthia': {
      const shuffledDeck = shuffle([...p().deckCards, ...p().hand]);
      const drawn = shuffledDeck.splice(0, 6);
      s = { ...s, players: { ...s.players, [pid]: { ...p(), deckCards: shuffledDeck, hand: drawn } } };
      break;
    }
    case 'hop': {
      s = drawCard(s, pid, 3);
      break;
    }
    case 'iono': {
      // Both players shuffle hand into deck and draw based on points
      const playerPts = Math.max(1, s.players['player'].points);
      const aiPts = Math.max(1, s.players['ai'].points);
      const playerDeck2 = shuffle([...s.players['player'].deckCards, ...s.players['player'].hand]);
      const aiDeck2 = shuffle([...s.players['ai'].deckCards, ...s.players['ai'].hand]);
      const playerDrawn = playerDeck2.splice(0, playerPts);
      const aiDrawn = aiDeck2.splice(0, aiPts);
      s = {
        ...s,
        players: {
          player: { ...s.players['player'], deckCards: playerDeck2, hand: playerDrawn },
          ai: { ...s.players['ai'], deckCards: aiDeck2, hand: aiDrawn },
        },
      };
      break;
    }
    case 'rare-candy': {
      // targetInstanceId = Basic Pokémon in play; search deck for its Stage1 or Stage2
      if (targetInstanceId) {
        const basic = p().playArea.find(pk => pk.instanceId === targetInstanceId);
        if (basic) {
          const basicName = basic.def.displayName;
          // Collect Stage1 (evolvesFrom === basicName) and any Stage2/higher from deck
          const candidates = p().deckCards.filter(c => {
            if (c.type !== 'pokemon') return false;
            const pk = c as PokemonCardDef;
            return pk.evolvesFrom === basicName;
          });
          if (candidates.length > 0) {
            s = { ...s, pendingDeckSearch: { trainerCardId: def.id, candidates, action: 'add-to-hand', rareCandyTargetInstanceId: targetInstanceId } };
          }
        }
      }
      break;
    }
  }

  return s;
}

// ─── Deck Search Completion ────────────────────────────────────────────────────

export function completeDeckSearch(state: GameState, pid: PlayerId, selectedCardId: string): GameState {
  let s = state;
  const search = s.pendingDeckSearch;
  if (!search) return s;

  const p = s.players[pid];
  const cardIdx = p.deckCards.findIndex(c => c.id === selectedCardId);
  if (cardIdx === -1) return s;

  const chosen = p.deckCards[cardIdx] as PokemonCardDef;
  const newDeck = shuffle(p.deckCards.filter((_, i) => i !== cardIdx));

  if (search.rareCandyTargetInstanceId) {
    // Rare Candy: apply chosen evolution directly to the target Basic in play
    const targetId = search.rareCandyTargetInstanceId;
    const evoDef = chosen;
    const newArea = p.playArea.map(pk => {
      if (pk.instanceId !== targetId) return pk;
      const damageTaken = pk.def.hp - pk.currentHp;
      return { ...pk, cardId: evoDef.id, def: evoDef, currentHp: Math.max(1, evoDef.hp - damageTaken), hasAttackedThisTurn: false, evolutionStack: [...pk.evolutionStack, evoDef] };
    });
    s = { ...s, pendingDeckSearch: null, players: { ...s.players, [pid]: { ...p, deckCards: newDeck, playArea: newArea } } };
    return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} usou Rare Candy e evoluiu para ${pid === 'player' ? evoDef.displayName : 'uma evolução'}.`);
  }

  if (search.action === 'add-to-hand') {
    s = {
      ...s,
      pendingDeckSearch: null,
      players: { ...s.players, [pid]: { ...p, deckCards: newDeck, hand: [...p.hand, chosen] } },
    };
    return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} buscou ${pid === 'player' ? chosen.displayName : 'um Pokémon'} do deck.`);
  } else {
    // put-in-play (nest-ball)
    const inst: PokemonInPlay = {
      instanceId: newId(), cardId: chosen.id, def: chosen,
      currentHp: chosen.hp, vulnerability: 'vulnerable',
      hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false,
      turnsInPlay: 0, evolutionStack: [chosen],
    };
    s = {
      ...s,
      pendingDeckSearch: null,
      players: { ...s.players, [pid]: { ...p, deckCards: newDeck, playArea: [...p.playArea, inst] } },
    };
    return log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} colocou ${chosen.displayName} em jogo via Nest Ball.`);
  }
}

// ─── Turn Management ───────────────────────────────────────────────────────────

export function startTurn(state: GameState, pid: PlayerId): GameState {
  let s = state;
  const p = s.players[pid];

  // Reset all energy to available (pool is cumulative, energy refreshes each turn)
  const refreshedPool = p.energyPool.map(e => ({ ...e, used: false }));

  // Reset Pokémon states and increment turnsInPlay
  const newArea = p.playArea.map(pk => ({
    ...pk,
    vulnerability: 'ready' as const,
    hasAttackedThisTurn: false,
    hasUsedAbilityThisTurn: false,
    turnsInPlay: pk.turnsInPlay + 1,
    damageReduction: undefined,
    weakenAttacker: undefined,
  }));

  s = {
    ...s,
    players: {
      ...s.players,
      [pid]: {
        ...p,
        playArea: newArea,
        energyPool: refreshedPool,
        supporterPlayedThisTurn: false,
        energyPlayedThisTurn: false,
        evolutionPlayedThisTurn: false,
      },
    },
  };

  // Draw a card
  s = drawCard(s, pid);
  if (s.phase === 'end') return s; // deck out

  // Check exhaustion: no Pokémon in play AND no Pokémon anywhere to place
  const pAfterDraw = s.players[pid];
  if (
    pAfterDraw.playArea.length === 0 &&
    pAfterDraw.hand.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic').length === 0 &&
    pAfterDraw.deckCards.filter(c => c.type === 'pokemon' && (c as PokemonCardDef).stage === 'Basic').length === 0
  ) {
    s = log(s, pid, `${pid === 'player' ? 'Você' : 'IA'} não tem Pokémon Básico disponível. Derrota por exaustão!`);
    return { ...s, result: pid === 'player' ? 'ai_wins' : 'player_wins', phase: 'end' };
  }

  return log(s, pid, `Turno ${s.turn} — ${pid === 'player' ? 'Sua vez.' : 'Vez da IA.'}`);
}

export function endTurn(state: GameState): GameState {
  const pid = state.currentPlayer;
  const nextPid = opponent(pid);

  // Lose if ending turn with no Pokémon in play AND had a KO before (not initial turns)
  const hadKO = state.players[pid].discardPile.some(c => c.type === 'pokemon');
  if (state.players[pid].playArea.length === 0 && hadKO) {
    const s = log(state, pid, `${pid === 'player' ? 'Você' : 'IA'} encerrou o turno sem Pokémon em jogo. Derrota!`);
    return { ...s, result: pid === 'player' ? 'ai_wins' : 'player_wins', phase: 'end' };
  }

  let s: GameState = { ...state, currentPlayer: nextPid };

  if (nextPid === 'player') {
    s = { ...s, turn: s.turn + 1 };
  }

  s = startTurn(s, nextPid);
  s = { ...s, selectedHandCard: null, selectedPlayAreaTarget: null, pendingAction: null, pendingDeckSearch: null, pendingFreeSummon: false };
  return s;
}
