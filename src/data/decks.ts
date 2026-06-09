// Starter Deck definitions: arrays of card IDs (60 cards each)
// Key: Pokémon do deck + trainers balanceados

export interface DeckDefinition {
  id: string;
  name: string;
  description: string;
  cards: string[]; // card ids (repeated for quantity)
}

// ─── Chamas da Coragem (Fire) ──────────────────────────────────────────────────
// Pokémon principais: Charizard ex line, Arcanine line, Ninetales line
const chamasDaCoragem: string[] = [
  // Charizard ex line ×3
  'charmander', 'charmander', 'charmander',
  'charmeleon', 'charmeleon', 'charmeleon',
  'charizard-ex', 'charizard-ex',
  // Arcanine line ×3
  'growlithe', 'growlithe', 'growlithe',
  'arcanine', 'arcanine', 'arcanine',
  // Ninetales line ×2
  'vulpix', 'vulpix',
  'ninetales', 'ninetales',
  // Support Pokémon
  'magmar', 'magmar',
  'magmortar',
  // Items ×4 each set
  'ultra-ball', 'ultra-ball', 'ultra-ball', 'ultra-ball',
  'nest-ball', 'nest-ball', 'nest-ball', 'nest-ball',
  'rare-candy', 'rare-candy', 'rare-candy', 'rare-candy',
  'potion', 'potion', 'potion',
  'super-potion', 'super-potion',
  'ordinary-rod', 'ordinary-rod',
  'super-rod',
  // Supporters ×4 each
  'professors-research', 'professors-research', 'professors-research', 'professors-research',
  'iono', 'iono', 'iono', 'iono',
  'cynthia', 'cynthia',
  'hop', 'hop',
  'bosss-orders',
];

// ─── Mentes Misteriosas (Psychic) ─────────────────────────────────────────────
// Pokémon principais: Gardevoir ex line, Alakazam line, Mew
const mentesMisteriosas: string[] = [
  // Gardevoir ex line ×3
  'ralts', 'ralts', 'ralts',
  'kirlia', 'kirlia', 'kirlia',
  'gardevoir-ex', 'gardevoir-ex',
  // Alakazam line ×3
  'abra', 'abra', 'abra',
  'kadabra', 'kadabra', 'kadabra',
  'alakazam', 'alakazam',
  // Mew ×2
  'mew', 'mew',
  // Support Pokémon
  'eevee', 'eevee',
  'pidgeot-ex',
  // Items ×4 each set
  'ultra-ball', 'ultra-ball', 'ultra-ball', 'ultra-ball',
  'nest-ball', 'nest-ball', 'nest-ball', 'nest-ball',
  'rare-candy', 'rare-candy', 'rare-candy', 'rare-candy',
  'potion', 'potion', 'potion',
  'super-potion', 'super-potion',
  'great-ball', 'great-ball',
  'level-ball',
  // Supporters ×4 each
  'professors-research', 'professors-research', 'professors-research', 'professors-research',
  'iono', 'iono', 'iono', 'iono',
  'cynthia', 'cynthia',
  'hop', 'hop',
  'bosss-orders',
];

export const STARTER_DECKS: DeckDefinition[] = [
  {
    id: 'chamas-da-coragem',
    name: 'Chamas da Coragem',
    description: 'Ataque agressivo com Charizard ex e Arcanine. Alta capacidade de dano e pressão constante.',
    cards: chamasDaCoragem,
  },
  {
    id: 'mentes-misteriosas',
    name: 'Mentes Misteriosas',
    description: 'Controle psíquico com Gardevoir ex e Alakazam. Habilidades poderosas e manobras de dano.',
    cards: mentesMisteriosas,
  },
];
