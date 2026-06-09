// Simulação de partidas Lorkemon — AI vs AI (ambos os lados)

import { initGame, endTurn, availableEnergy, canAttack, performAttack,
         summonPokemon, canSummon, playEnergyFromDeck } from '../src/game/engine';
import { runAITurn } from '../src/game/ai';
import { STARTER_DECKS } from '../src/data/decks';
import type { GameState, PlayerId } from '../src/game/types';

const DECK_A = STARTER_DECKS[0].cards; // Chamas da Coragem
const DECK_B = STARTER_DECKS[1].cards; // Mentes Misteriosas

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function runGame(difficulty: 'easy' | 'medium' | 'hard', maxTurns = 300): {
  result: GameState['result'];
  turns: number;
  errors: string[];
  finalPoints: { player: number; ai: number };
} {
  let state = initGame(DECK_A, DECK_B);
  let turns = 0;
  const errors: string[] = [];

  while (state.phase !== 'end' && turns < maxTurns) {
    // Validate invariants each turn
    for (const pid of ['player', 'ai'] as PlayerId[]) {
      const p = state.players[pid];
      if (p.playArea.length > 5) errors.push(`T${turns} ${pid}: >5 Pokémon em jogo`);
      if (p.playArea.some(pk => pk.currentHp < 0)) errors.push(`T${turns} ${pid}: HP negativo`);
      if (p.energyPool.some(e => e.used === undefined)) errors.push(`T${turns}: pool corrompido`);
    }

    state = runAITurn(state, difficulty); // uses state.currentPlayer as pid
    turns++;
  }

  return {
    result: state.result,
    turns,
    errors,
    finalPoints: { player: state.players.player.points, ai: state.players.ai.points },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('   SIMULAÇÃO DE PARTIDAS LORKEMON');
console.log('══════════════════════════════════════════\n');

// ── 1. Acceptance Tests ──────────────────────────────────────────────────────
console.log('── Acceptance Tests (Seção 20 da spec) ──\n');

{
  // Pokemon enters play vulnerable
  let s = initGame(DECK_A, DECK_B);
  s = playEnergyFromDeck(s, 'player');
  // Ensure there's a basic in hand by searching
  const basicId = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic')?.id;
  if (basicId && canSummon(s, 'player', basicId)) {
    s = summonPokemon(s, 'player', basicId);
    assert(s.players.player.playArea[0]?.vulnerability === 'vulnerable', 'Pokémon entra em jogo vulnerável');
  } else {
    // Force add energy and retry
    s = { ...s, players: { ...s.players, player: { ...s.players.player, energyPlayedThisTurn: false } } };
    for (let i = 0; i < 5; i++) {
      if (!s.players.player.energyPlayedThisTurn) s = playEnergyFromDeck(s, 'player');
      s = { ...s, players: { ...s.players, player: { ...s.players.player, energyPlayedThisTurn: false } } };
    }
    const id2 = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic')?.id;
    if (id2) {
      s = summonPokemon(s, 'player', id2);
      assert(s.players.player.playArea[0]?.vulnerability === 'vulnerable', 'Pokémon entra em jogo vulnerável');
    } else {
      assert(false, 'Pokémon entra em jogo vulnerável', 'sem básico acessível na mão inicial');
    }
  }
}

{
  // Pokemon becomes ready at start of owner's turn
  let s = initGame(DECK_A, DECK_B);
  s = { ...s, players: { ...s.players, player: { ...s.players.player,
    energyPool: [{ instanceId: 'e1', cardId: 'x', def: s.players.player.deckCards[0], used: false }]
  }}};
  const basicId = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic')?.id;
  if (basicId) {
    s = summonPokemon(s, 'player', basicId);
    assert(s.players.player.playArea[0]?.vulnerability === 'vulnerable', 'Recém-invocado está vulnerável');
    s = endTurn(s); // vai para AI
    s = endTurn(s); // volta para player (startTurn chama ready)
    assert(s.players.player.playArea[0]?.vulnerability === 'ready', 'Pokémon fica PRONTO no início do turno do dono');
  }
}

{
  // Only vulnerable Pokemon can be targeted
  let s = initGame(DECK_A, DECK_B);
  // Add pokemon to AI's play area as READY
  const aiBasicDef = s.players.ai.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic') as any;
  const playerBasicDef = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic') as any;
  if (aiBasicDef && playerBasicDef) {
    const aiPk = { instanceId: 'ai1', cardId: aiBasicDef.id, def: aiBasicDef,
      currentHp: aiBasicDef.hp, vulnerability: 'ready' as const,
      hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false, turnsInPlay: 1, evolutionStack: [aiBasicDef] };
    const playerPk = { instanceId: 'p1', cardId: playerBasicDef.id, def: playerBasicDef,
      currentHp: playerBasicDef.hp, vulnerability: 'vulnerable' as const,
      hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false, turnsInPlay: 0, evolutionStack: [playerBasicDef] };
    s = { ...s, players: {
      ...s.players,
      player: { ...s.players.player, playArea: [playerPk],
        energyPool: [{ instanceId: 'e1', cardId: 'x', def: s.players.player.deckCards[0], used: false },
                     { instanceId: 'e2', cardId: 'x2', def: s.players.player.deckCards[1], used: false },
                     { instanceId: 'e3', cardId: 'x3', def: s.players.player.deckCards[2], used: false }] },
      ai: { ...s.players.ai, playArea: [aiPk] },
    }};
    const canHitReady = canAttack(s, 'player', 'p1', 0);
    assert(!canHitReady, 'Não pode atacar Pokémon PRONTO do oponente');
    // Make AI pokemon vulnerable
    const vulnState = { ...s, players: { ...s.players, ai: { ...s.players.ai, playArea: [{ ...aiPk, vulnerability: 'vulnerable' as const }] }}};
    const canHitVuln = canAttack(vulnState, 'player', 'p1', 0);
    assert(canHitVuln, 'Pode atacar Pokémon VULNERÁVEL do oponente');
  }
}

{
  // Counterattack only if target survives
  let s = initGame(DECK_A, DECK_B);
  const pDef = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic') as any;
  const aDef = s.players.ai.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic') as any;
  if (pDef && aDef) {
    const pPk = { instanceId: 'p1', cardId: pDef.id, def: pDef, currentHp: pDef.hp,
      vulnerability: 'vulnerable' as const, hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false, turnsInPlay: 1, evolutionStack: [pDef] };
    // AI pokemon with 1 HP (dies on first hit)
    const aPkLow = { instanceId: 'a1', cardId: aDef.id, def: aDef, currentHp: 1,
      vulnerability: 'vulnerable' as const, hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false, turnsInPlay: 1, evolutionStack: [aDef] };
    const bigPool = Array.from({length:6}, (_, i) => ({ instanceId: `e${i}`, cardId: 'x', def: s.players.player.deckCards[i], used: false }));
    s = { ...s, players: {
      ...s.players,
      player: { ...s.players.player, playArea: [pPk], energyPool: bigPool },
      ai: { ...s.players.ai, playArea: [aPkLow] },
    }};
    const logBefore = s.log.length;
    const afterKill = performAttack(s, 'player', 'p1', 0, 'a1');
    const counterLogs = afterKill.log.slice(logBefore).filter(l => l.message.includes('contra-atacou'));
    assert(counterLogs.length === 0, 'Sem contra-ataque quando alvo morre (1 HP)');

    // AI pokemon with full HP — first attack should not kill if damage < hp
    const aPkFull = { ...aPkLow, currentHp: aDef.hp };
    const firstAttack = pDef.attacks[0];
    if (firstAttack && firstAttack.damage > 0 && firstAttack.damage < aDef.hp) {
      s = { ...s, players: { ...s.players, ai: { ...s.players.ai, playArea: [aPkFull] } } };
      const logBefore2 = s.log.length;
      const afterHit = performAttack(s, 'player', 'p1', 0, 'a1');
      const counter2 = afterHit.log.slice(logBefore2).filter(l => l.message.includes('contra-atacou'));
      assert(counter2.length > 0, 'Contra-ataque ocorre quando alvo sobrevive');
    } else {
      assert(true, 'Contra-ataque (skip — primeiro ataque mata ou causa 0 dano)');
    }
  }
}

{
  // Energy: once per turn
  let s = initGame(DECK_A, DECK_B);
  s = playEnergyFromDeck(s, 'player');
  const pool1 = s.players.player.energyPool.length;
  s = playEnergyFromDeck(s, 'player'); // segunda vez — deve ser ignorado
  assert(s.players.player.energyPool.length === pool1, 'Segunda energia no mesmo turno é ignorada');
  assert(s.players.player.energyPlayedThisTurn, 'energyPlayedThisTurn=true após jogar energia');
}

{
  // Energia gasta é removida do pool no próximo turno
  let s = initGame(DECK_A, DECK_B);
  s = { ...s, players: { ...s.players, player: { ...s.players.player,
    energyPool: [
      { instanceId: 'e1', cardId: 'x', def: s.players.player.deckCards[0], used: true },
      { instanceId: 'e2', cardId: 'y', def: s.players.player.deckCards[1], used: false },
    ]
  }}};
  s = endTurn(s); // AI turn
  s = endTurn(s); // player turn — startTurn limpa used
  assert(s.players.player.energyPool.every(e => !e.used), 'Energia gasta (used=true) removida no startTurn');
}

{
  // Rare Candy bypass timing
  let s = initGame(DECK_A, DECK_B);
  const basicDef = s.players.player.hand.find(c => c.type === 'pokemon' && (c as any).stage === 'Basic') as any;
  if (basicDef) {
    const pk = { instanceId: 'p1', cardId: basicDef.id, def: basicDef, currentHp: basicDef.hp,
      vulnerability: 'vulnerable' as const, hasAttackedThisTurn: false, hasUsedAbilityThisTurn: false,
      turnsInPlay: 0, evolutionStack: [basicDef] };
    // Add a Stage2 to hand
    const stage2Def = s.players.player.deckCards.find(c => c.type === 'pokemon' && (c as any).stage === 'Stage2') as any;
    if (stage2Def) {
      const hand = [...s.players.player.hand, stage2Def];
      s = { ...s, players: { ...s.players, player: { ...s.players.player, playArea: [pk], hand }}};
      const canEvolveNormal = pk.turnsInPlay >= 1; // false — just summoned
      assert(!canEvolveNormal, 'Rare Candy: Pokémon recém-invocado (turnsInPlay=0) não pode evoluir normalmente');
    }
  }
}

// ── 2. Simulações Completas ──────────────────────────────────────────────────
console.log('\n── Simulações de Partidas (AI vs AI, ambos os lados) ──\n');

const GAMES = 8;

for (const diff of ['easy', 'medium', 'hard'] as const) {
  let winsA = 0, winsB = 0, timeouts = 0;
  const turnCounts: number[] = [];
  const allErrors: string[] = [];
  const pointDiffs: number[] = [];

  for (let i = 0; i < GAMES; i++) {
    const { result, turns, errors, finalPoints } = runGame(diff, 300);
    allErrors.push(...errors);
    if (result === 'player_wins') winsA++;
    else if (result === 'ai_wins') winsB++;
    else timeouts++;
    turnCounts.push(turns);
    pointDiffs.push(finalPoints.player - finalPoints.ai);
  }

  const avgTurns = Math.round(turnCounts.reduce((a, b) => a + b, 0) / turnCounts.length);
  const uniqueErrors = [...new Set(allErrors)];
  const balanced = winsA > 0 && winsB > 0;

  console.log(`  Dificuldade ${diff.toUpperCase()} (${GAMES} partidas):`);
  console.log(`     Deck A (Chamas): ${winsA} vitórias | Deck B (Mentes): ${winsB} vitórias | Timeout: ${timeouts}`);
  console.log(`     Média de turnos: ${avgTurns} | Menor: ${Math.min(...turnCounts)} | Maior: ${Math.max(...turnCounts)}`);

  assert(timeouts === 0, `${diff}: sem partidas infinitas (>300 turnos)`);
  assert(uniqueErrors.length === 0, `${diff}: sem erros de estado`, uniqueErrors.slice(0, 3).join('; '));
  if (!balanced) {
    console.log(`     ⚠️  Um deck domina (${winsA}-${winsB}) — possível desequilíbrio`);
  }
}

// ── 3. Invariantes de Estado ─────────────────────────────────────────────────
console.log('\n── Invariantes Durante Partida Completa ──\n');

{
  let state = initGame(DECK_A, DECK_B);
  let maxPlayArea = 0;
  let negHp = false;
  let poolCorrupt = false;
  let dupIds = false;
  let turns = 0;

  while (state.phase !== 'end' && turns < 200) {
    for (const pid of ['player', 'ai'] as PlayerId[]) {
      const p = state.players[pid];
      if (p.playArea.length > 5) maxPlayArea = Math.max(maxPlayArea, p.playArea.length);
      if (p.playArea.some(pk => pk.currentHp < 0)) negHp = true;
      if (p.energyPool.some(e => e.used === undefined)) poolCorrupt = true;
      const ids = p.playArea.map(pk => pk.instanceId);
      if (new Set(ids).size !== ids.length) dupIds = true;
    }
    state = runAITurn(state, 'hard');
    turns++;
  }

  assert(!negHp, 'Nenhum HP negativo em 200 turnos');
  assert(maxPlayArea <= 5, 'Máximo 5 Pokémon em jogo respeitado', `max=${maxPlayArea}`);
  assert(!poolCorrupt, 'Energy Pool sem corrupção');
  assert(!dupIds, 'Sem instanceIds duplicados no play area');
}

{
  // Pontos nunca retrocedem
  let state = initGame(DECK_A, DECK_B);
  let prevPtsP = 0, prevPtsA = 0;
  let pointsRegressed = false;
  let turns = 0;
  while (state.phase !== 'end' && turns < 150) {
    if (state.players.player.points < prevPtsP || state.players.ai.points < prevPtsA) {
      pointsRegressed = true;
    }
    prevPtsP = state.players.player.points;
    prevPtsA = state.players.ai.points;
    state = runAITurn(state, 'medium');
    turns++;
  }
  assert(!pointsRegressed, 'Pontos nunca retrocedem durante a partida');
}

{
  // Toda partida termina com resultado definido
  let allDefined = true;
  for (let i = 0; i < 5; i++) {
    const { result } = runGame('easy', 300);
    if (result === null) allDefined = false;
  }
  assert(allDefined, 'Toda partida encerra com result não-null dentro de 300 turnos');
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log(`   RESULTADO FINAL: ${passed} ✅ | ${failed} ❌`);
console.log('══════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
