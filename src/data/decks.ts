export interface DeckDefinition {
  id: string;
  name: string;
  description: string;
  cards: string[];
}

// ─── Chamas da Coragem (Fire) — 60 cartas ─────────────────────────────────────
// Pokémon: 21 | Trainers: 39
const chamasDaCoragem: string[] = [
  // Charizard ex line ×3 set
  'charmander', 'charmander', 'charmander',
  'charmeleon', 'charmeleon', 'charmeleon',
  'charizard-ex', 'charizard-ex',
  // Arcanine line ×3 set
  'growlithe', 'growlithe', 'growlithe',
  'arcanine', 'arcanine', 'arcanine',
  // Ninetales line ×2 set
  'vulpix', 'vulpix',
  'ninetales', 'ninetales',
  // Support Pokémon
  'magmar', 'magmar',
  'magmortar',
  // Items (×4 each = 28)
  'ultra-ball',    'ultra-ball',    'ultra-ball',    'ultra-ball',
  'nest-ball',     'nest-ball',     'nest-ball',     'nest-ball',
  'rare-candy',    'rare-candy',    'rare-candy',    'rare-candy',
  'level-ball',    'level-ball',
  'switch',        'switch',
  'potion',        'potion',        'potion',
  'super-potion',  'super-potion',
  'ordinary-rod',  'ordinary-rod',
  'super-rod',
  // Supporters (×4 + ×4 + ×2 + ×2 + ×2 + ×1 = 15)
  'professors-research', 'professors-research', 'professors-research', 'professors-research',
  'iono',   'iono',   'iono',   'iono',
  'cynthia', 'cynthia',
  'hop',    'hop',    'hop',
  'bosss-orders', 'bosss-orders',
];

// ─── Mentes Misteriosas (Psychic) — 60 cartas ────────────────────────────────
// Pokémon: 23 | Trainers: 37
const mentesMisteriosas: string[] = [
  // Gardevoir ex line ×3 set
  'ralts', 'ralts', 'ralts',
  'kirlia', 'kirlia', 'kirlia',
  'gardevoir-ex', 'gardevoir-ex',
  // Alakazam line ×3 set
  'abra', 'abra', 'abra',
  'kadabra', 'kadabra', 'kadabra',
  'alakazam', 'alakazam',
  // Mew ×2
  'mew', 'mew',
  // Support Pokémon
  'eevee', 'eevee',
  'pidgeot-ex',
  // Items
  'ultra-ball',    'ultra-ball',    'ultra-ball',    'ultra-ball',
  'nest-ball',     'nest-ball',     'nest-ball',     'nest-ball',
  'rare-candy',    'rare-candy',    'rare-candy',    'rare-candy',
  'great-ball',    'great-ball',
  'level-ball',    'level-ball',
  'switch',        'switch',
  'potion',        'potion',        'potion',
  'super-potion',  'super-potion',
  'ordinary-rod',  'ordinary-rod',
  // Supporters
  'professors-research', 'professors-research', 'professors-research', 'professors-research',
  'iono',   'iono',   'iono',   'iono',
  'cynthia', 'cynthia',
  'hop',    'hop',
  'bosss-orders', 'bosss-orders',
];

// Sanity check (run in dev)
if (chamasDaCoragem.length !== 60) {
  console.warn(`Chamas da Coragem tem ${chamasDaCoragem.length} cartas (esperado 60)`);
}
if (mentesMisteriosas.length !== 60) {
  console.warn(`Mentes Misteriosas tem ${mentesMisteriosas.length} cartas (esperado 60)`);
}

// ─── Tempestade Elétrica (Electric) — 60 cartas ──────────────────────────────
// Pokémon: 20 | Trainers: 40
const tempestadeEletrica: string[] = [
  // Pikachu/Raichu line ×3 set
  'pikachu', 'pikachu', 'pikachu',
  'raichu', 'raichu', 'raichu',
  // Magnemite/Magneton/Luxray line
  'magnemite', 'magnemite', 'magnemite',
  'magneton', 'magneton',
  'luxray', 'luxray',
  // Electabuzz/Electivire line
  'electabuzz', 'electabuzz', 'electabuzz',
  'electivire', 'electivire',
  // Zapdos — powerful standalone
  'zapdos', 'zapdos',
  // Items (40)
  'ultra-ball',    'ultra-ball',    'ultra-ball',    'ultra-ball',
  'nest-ball',     'nest-ball',     'nest-ball',     'nest-ball',
  'rare-candy',    'rare-candy',    'rare-candy',    'rare-candy',
  'great-ball',    'great-ball',
  'level-ball',    'level-ball',
  'switch',        'switch',
  'potion',        'potion',        'potion',
  'super-potion',  'super-potion',
  'ordinary-rod',  'ordinary-rod',
  // Supporters
  'professors-research', 'professors-research', 'professors-research', 'professors-research',
  'iono',   'iono',   'iono',   'iono',
  'cynthia', 'cynthia',
  'hop',    'hop',
  'bosss-orders', 'bosss-orders', 'bosss-orders',
];

if (tempestadeEletrica.length !== 60) {
  console.warn(`Tempestade Elétrica tem ${tempestadeEletrica.length} cartas (esperado 60)`);
}

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
  {
    id: 'tempestade-eletrica',
    name: 'Tempestade Elétrica',
    description: 'Velocidade elétrica com Raichu, Luxray e Zapdos. Pressão constante e ataques poderosos.',
    cards: tempestadeEletrica,
  },
];
