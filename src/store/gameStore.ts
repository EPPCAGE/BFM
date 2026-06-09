import { create } from 'zustand';
import type { GameState } from '../game/types';
import {
  initGame, endTurn, canSummon, summonPokemon, canAttack, performAttack, performAbilityAttack,
  canPlayTrainer, playTrainer, playEnergyFromHand, playEnergyFromDeck,
  playEnergyFromDiscard,
} from '../game/engine';
import { runAITurn } from '../game/ai';
import { STARTER_DECKS } from '../data/decks';

type AIDifficulty = 'easy' | 'medium' | 'hard';

interface GameStore {
  gameState: GameState | null;
  selectedDeckId: string;
  aiDifficulty: AIDifficulty;

  startGame: (playerDeckId: string, aiDeckId: string, difficulty: AIDifficulty) => void;
  resetGame: () => void;
  setDifficulty: (d: AIDifficulty) => void;
  setDeck: (id: string) => void;

  // Player actions
  selectHandCard: (cardId: string | null) => void;
  playEnergyFromHandAction: (cardIndex: number) => void;
  playEnergyFromDeckAction: () => void;
  playEnergyFromDiscardAction: () => void;
  summonAction: (cardId: string) => void;
  attackAction: (attackerInstanceId: string, attackIndex: number, targetInstanceId: string) => void;
  abilityAttackAction: (attackerInstanceId: string, attackIndex: number, handIndex?: number) => void;
  playTrainerAction: (cardId: string, targetInstanceId?: string) => void;
  endTurnAction: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedDeckId: STARTER_DECKS[0].id,
  aiDifficulty: 'medium',

  startGame: (playerDeckId, aiDeckId, difficulty) => {
    const playerDeck = STARTER_DECKS.find(d => d.id === playerDeckId)!;
    const aiDeck = STARTER_DECKS.find(d => d.id === aiDeckId)!;
    const state = initGame(playerDeck.cards, aiDeck.cards);
    set({ gameState: state, aiDifficulty: difficulty });
  },

  resetGame: () => set({ gameState: null }),

  setDifficulty: (d) => set({ aiDifficulty: d }),
  setDeck: (id) => set({ selectedDeckId: id }),

  selectHandCard: (cardId) => {
    const { gameState } = get();
    if (!gameState) return;
    set({ gameState: { ...gameState, selectedHandCard: cardId } });
  },

  playEnergyFromHandAction: (cardIndex) => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    const ns = playEnergyFromHand(gameState, 'player', cardIndex);
    set({ gameState: ns });
  },

  playEnergyFromDeckAction: () => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    set({ gameState: playEnergyFromDeck(gameState, 'player') });
  },

  playEnergyFromDiscardAction: () => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    set({ gameState: playEnergyFromDiscard(gameState, 'player') });
  },

  summonAction: (cardId) => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    if (!canSummon(gameState, 'player', cardId)) return;
    set({ gameState: summonPokemon(gameState, 'player', cardId) });
  },

  attackAction: (attackerInstanceId, attackIndex, targetInstanceId) => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    if (!canAttack(gameState, 'player', attackerInstanceId, attackIndex)) return;
    const ns = performAttack(gameState, 'player', attackerInstanceId, attackIndex, targetInstanceId);
    set({ gameState: ns });
  },

  abilityAttackAction: (attackerInstanceId, attackIndex, handIndex?) => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    const ns = performAbilityAttack(gameState, 'player', attackerInstanceId, attackIndex, handIndex);
    set({ gameState: ns });
  },

  playTrainerAction: (cardId, targetInstanceId?) => {
    const { gameState } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    if (!canPlayTrainer(gameState, 'player', cardId)) return;
    set({ gameState: playTrainer(gameState, 'player', cardId, targetInstanceId) });
  },

  endTurnAction: () => {
    const { gameState, aiDifficulty } = get();
    if (!gameState || gameState.currentPlayer !== 'player') return;
    let ns = endTurn(gameState);
    if (ns.phase === 'end') { set({ gameState: ns }); return; }

    // AI turn (with small delay handled in UI)
    ns = { ...ns, aiThinking: true };
    set({ gameState: ns });

    setTimeout(() => {
      const current = get().gameState;
      if (!current) return;
      const afterAI = runAITurn(current, aiDifficulty);
      set({ gameState: { ...afterAI, aiThinking: false } });
    }, 800);
  },
}));
