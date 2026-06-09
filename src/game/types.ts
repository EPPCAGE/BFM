// ─── Card Types ────────────────────────────────────────────────────────────────

export type PokemonStage = 'Basic' | 'Stage1' | 'Stage2' | 'ex' | 'GX' | 'V' | 'VMAX' | 'VSTAR';
export type PokemonType =
  | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic'
  | 'Fighting' | 'Normal' | 'Dragon' | 'Dark' | 'Metal' | 'Fairy';

export type AbilityCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type AttackEffectType = 'draw3' | 'shield30' | 'weaken-attacker' | 'teleport';

export interface Attack {
  name: string;
  cost: number;         // total energy count (generic)
  damage: number;       // numeric damage (0 if effect only)
  damageText?: string;  // e.g. "30+" or "50×"
  effect?: string;
  effectType?: AttackEffectType; // for 0-damage ability-attacks
}

export interface Ability {
  name: string;
  category: AbilityCategory;
  cost?: number;        // only for category C
  text: string;
}

export interface PokemonCardDef {
  id: string;
  displayName: string;
  type: 'pokemon';
  pokemonType: PokemonType;
  stage: PokemonStage;
  hp: number;
  retreatCost: number;
  pointValue: number;
  evolvesFrom?: string;  // displayName of base form
  attacks: Attack[];
  ability?: Ability;
  imageUrl: string;
  tcgId: string;         // pokemontcg.io card id for image fallback
}

export interface TrainerCardDef {
  id: string;
  displayName: string;
  type: 'item' | 'supporter';
  cost: number;          // 1 for item, 3 for supporter
  effect: string;
  imageUrl: string;
  tcgId: string;
}

export type CardDef = PokemonCardDef | TrainerCardDef;

// ─── In-Play Instances ─────────────────────────────────────────────────────────

export type VulnerabilityState = 'ready' | 'vulnerable';

export interface PokemonInPlay {
  instanceId: string;
  cardId: string;
  def: PokemonCardDef;
  currentHp: number;
  vulnerability: VulnerabilityState;
  hasAttackedThisTurn: boolean;
  hasUsedAbilityThisTurn: boolean;
  turnsInPlay: number;          // incremented at end of owner's turn
  evolutionStack: PokemonCardDef[]; // [base, stage1, ...] current = last
  damageReduction?: number;     // damage shield active this turn (shield30)
  weakenAttacker?: number;      // next attacker deals this much less (fedor)
}

export interface EnergyCard {
  instanceId: string;
  cardId: string;
  def: CardDef;
  used: boolean;
}

// ─── Player State ──────────────────────────────────────────────────────────────

export type PlayerId = 'player' | 'ai';

export interface PlayerState {
  id: PlayerId;
  deckCards: CardDef[];       // remaining deck (top = index 0)
  hand: CardDef[];
  discardPile: CardDef[];
  energyPool: EnergyCard[];
  playArea: PokemonInPlay[];
  points: number;
  supporterPlayedThisTurn: boolean;
  energyPlayedThisTurn: boolean;
}

// ─── Game State ────────────────────────────────────────────────────────────────

export type GamePhase = 'setup' | 'main' | 'end';
export type GameResult = 'player_wins' | 'ai_wins' | null;

export interface LogEntry {
  id: string;
  turn: number;
  player: PlayerId;
  message: string;
}

export interface GameState {
  turn: number;
  currentPlayer: PlayerId;
  phase: GamePhase;
  players: { player: PlayerState; ai: PlayerState };
  log: LogEntry[];
  result: GameResult;
  selectedHandCard: string | null;       // instanceId or cardId
  selectedPlayAreaTarget: string | null; // instanceId to attack
  pendingAction: PendingAction | null;
  pendingDeckSearch: PendingDeckSearch | null;
  pendingFreeSummon: boolean;
  aiThinking: boolean;
}

export type PendingAction =
  | { type: 'choose_energy_source' }
  | { type: 'choose_attack_target'; attackerInstanceId: string }
  | { type: 'choose_summon_slot'; cardId: string }
  | { type: 'choose_evolution_target'; cardId: string };

export interface PendingDeckSearch {
  trainerCardId: string;
  candidates: CardDef[];
  action: 'add-to-hand' | 'put-in-play';
  rareCandyTargetInstanceId?: string; // set when Rare Candy triggers an evolution search
}
