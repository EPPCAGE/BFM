export interface DeckDefinition {
  id: string;
  name: string;
  description: string;
  cards: string[];
}

// Standard trainer suite (20 cards) used by all decks:
// ultra-ball×2, nest-ball×2, rare-candy×2, level-ball×2, switch×2,
// potion×2, super-potion×1, ordinary-rod×1,
// professors-research×2, iono×2, bosss-orders×2
const STANDARD_TRAINERS: string[] = [
  'ultra-ball',          'ultra-ball',
  'nest-ball',           'nest-ball',
  'rare-candy',          'rare-candy',
  'level-ball',          'level-ball',
  'switch',              'switch',
  'potion',              'potion',
  'super-potion',
  'ordinary-rod',
  'professors-research', 'professors-research',
  'iono',                'iono',
  'bosss-orders',        'bosss-orders',
];

// ─── Chamas da Coragem (Fire) — 60 cartas ─────────────────────────────────────
// Pokémon: 40 | Trainers: 20
const chamasDaCoragem: string[] = [
  // Charizard ex line ×4
  'charmander', 'charmander', 'charmander', 'charmander',
  'charmeleon', 'charmeleon', 'charmeleon', 'charmeleon',
  'charizard-ex', 'charizard-ex', 'charizard-ex', 'charizard-ex',
  // Arcanine line ×4
  'growlithe', 'growlithe', 'growlithe', 'growlithe',
  'arcanine', 'arcanine', 'arcanine', 'arcanine',
  // Ninetales line ×4
  'vulpix', 'vulpix', 'vulpix', 'vulpix',
  'ninetales', 'ninetales', 'ninetales', 'ninetales',
  // Magmar/Magmortar line ×4
  'magmar', 'magmar', 'magmar', 'magmar',
  'magmortar', 'magmortar', 'magmortar', 'magmortar',
  // Ponyta ×4
  'ponyta', 'ponyta', 'ponyta', 'ponyta',
  // Trainers
  ...STANDARD_TRAINERS,
];

// ─── Mentes Misteriosas (Psychic) — 60 cartas ────────────────────────────────
// Pokémon: 40 | Trainers: 20
const mentesMisteriosas: string[] = [
  // Gardevoir ex line ×4
  'ralts',        'ralts',        'ralts',        'ralts',
  'kirlia',       'kirlia',       'kirlia',       'kirlia',
  'gardevoir-ex', 'gardevoir-ex', 'gardevoir-ex', 'gardevoir-ex',
  // Alakazam line ×4
  'abra',     'abra',     'abra',     'abra',
  'kadabra',  'kadabra',  'kadabra',  'kadabra',
  'alakazam', 'alakazam', 'alakazam', 'alakazam',
  // Mew ×4
  'mew', 'mew', 'mew', 'mew',
  // Eevee ×4
  'eevee', 'eevee', 'eevee', 'eevee',
  // Jigglypuff ×4
  'jigglypuff', 'jigglypuff', 'jigglypuff', 'jigglypuff',
  // Slowpoke ×4
  'slowpoke', 'slowpoke', 'slowpoke', 'slowpoke',
  // Trainers
  ...STANDARD_TRAINERS,
];

// ─── Tempestade Elétrica (Electric) — 60 cartas ──────────────────────────────
// Pokémon: 40 | Trainers: 20
const tempestadeEletrica: string[] = [
  // Pikachu/Raichu line ×4
  'pikachu', 'pikachu', 'pikachu', 'pikachu',
  'raichu',  'raichu',  'raichu',  'raichu',
  // Magnemite/Magneton/Luxray line ×4
  'magnemite', 'magnemite', 'magnemite', 'magnemite',
  'magneton',  'magneton',  'magneton',  'magneton',
  'luxray',    'luxray',    'luxray',    'luxray',
  // Electabuzz/Electivire line ×4
  'electabuzz', 'electabuzz', 'electabuzz', 'electabuzz',
  'electivire', 'electivire', 'electivire', 'electivire',
  // Zapdos ×4
  'zapdos', 'zapdos', 'zapdos', 'zapdos',
  // Voltorb/Electrode line ×4
  'voltorb',   'voltorb',   'voltorb',   'voltorb',
  'electrode', 'electrode', 'electrode', 'electrode',
  // Trainers
  ...STANDARD_TRAINERS,
];

// ─── Sombras Ancestrais (Ghost/Psychic) — 60 cartas ─────────────────────────
// Pokémon: 40 | Trainers: 20
const sombraAncestral: string[] = [
  // Gastly/Haunter/Gengar line ×4
  'gastly',  'gastly',  'gastly',  'gastly',
  'haunter', 'haunter', 'haunter', 'haunter',
  'gengar',  'gengar',  'gengar',  'gengar',
  // Drowzee/Hypno line ×4
  'drowzee', 'drowzee', 'drowzee', 'drowzee',
  'hypno',   'hypno',   'hypno',   'hypno',
  // Mewtwo ×4
  'mewtwo', 'mewtwo', 'mewtwo', 'mewtwo',
  // Mr. Mime ×4
  'mr-mime', 'mr-mime', 'mr-mime', 'mr-mime',
  // Jynx ×4
  'jynx', 'jynx', 'jynx', 'jynx',
  // Mew ×4
  'mew', 'mew', 'mew', 'mew',
  // Abra ×4
  'abra', 'abra', 'abra', 'abra',
  // Trainers
  ...STANDARD_TRAINERS,
];

// ─── Abismo Aquático (Water) — 60 cartas ─────────────────────────────────────
// Pokémon: 40 | Trainers: 20
const abismoAquatico: string[] = [
  // Psyduck/Golduck line ×4
  'psyduck', 'psyduck', 'psyduck', 'psyduck',
  'golduck', 'golduck', 'golduck', 'golduck',
  // Horsea/Seadra line ×4
  'horsea', 'horsea', 'horsea', 'horsea',
  'seadra', 'seadra', 'seadra', 'seadra',
  // Seel/Dewgong line ×4
  'seel',   'seel',   'seel',   'seel',
  'dewgong','dewgong','dewgong','dewgong',
  // Lapras ×4
  'lapras', 'lapras', 'lapras', 'lapras',
  // Eevee/Vaporeon line ×4
  'eevee',   'eevee',   'eevee',   'eevee',
  'vaporeon','vaporeon','vaporeon','vaporeon',
  // Slowpoke ×4
  'slowpoke', 'slowpoke', 'slowpoke', 'slowpoke',
  // Trainers
  ...STANDARD_TRAINERS,
];

// ─── Sombras Negras (Dark) — 60 cartas ───────────────────────────────────────
const sombrasNegras: string[] = [
  // Tyranitar line ×4
  'larvitar', 'larvitar', 'larvitar', 'larvitar',
  'pupitar',  'pupitar',  'pupitar',  'pupitar',
  'tyranitar','tyranitar','tyranitar','tyranitar',
  // Houndoom line ×4
  'houndour', 'houndour', 'houndour', 'houndour',
  'houndoom', 'houndoom', 'houndoom', 'houndoom',
  // Weavile line ×4
  'sneasel', 'sneasel', 'sneasel', 'sneasel',
  'weavile',  'weavile',  'weavile',  'weavile',
  // Honchkrow line ×4
  'murkrow',   'murkrow',   'murkrow',   'murkrow',
  'honchkrow', 'honchkrow', 'honchkrow', 'honchkrow',
  // Darkrai ×4
  'darkrai', 'darkrai', 'darkrai', 'darkrai',
  ...STANDARD_TRAINERS,
];

// ─── Fúria Dracônica (Dragon) — 60 cartas ────────────────────────────────────
const furiaDraconica: string[] = [
  // Dragonite line ×4
  'dratini',   'dratini',   'dratini',   'dratini',
  'dragonair', 'dragonair', 'dragonair', 'dragonair',
  'dragonite', 'dragonite', 'dragonite', 'dragonite',
  // Garchomp line ×4
  'gible',    'gible',    'gible',    'gible',
  'gabite',   'gabite',   'gabite',   'gabite',
  'garchomp', 'garchomp', 'garchomp', 'garchomp',
  // Salamence line ×4
  'bagon',    'bagon',    'bagon',    'bagon',
  'shelgon',  'shelgon',  'shelgon',  'shelgon',
  'salamence','salamence','salamence','salamence',
  // Extras
  'dratini', 'dratini', 'dragonair', 'dragonite',
  ...STANDARD_TRAINERS,
];

// ─── Coração de Aço (Metal) — 60 cartas ──────────────────────────────────────
const coracaoDeAco: string[] = [
  // Metagross line ×4
  'beldum',   'beldum',   'beldum',   'beldum',
  'metang',   'metang',   'metang',   'metang',
  'metagross','metagross','metagross','metagross',
  // Scizor line ×4
  'scyther', 'scyther', 'scyther', 'scyther',
  'scizor',  'scizor',  'scizor',  'scizor',
  // Steelix line ×4
  'onix',    'onix',    'onix',    'onix',
  'steelix', 'steelix', 'steelix', 'steelix',
  // Jirachi ×4 + Skarmory ×4 + extras
  'jirachi',  'jirachi',  'jirachi',  'jirachi',
  'skarmory', 'skarmory', 'skarmory', 'skarmory',
  'beldum', 'beldum', 'metang', 'metagross',
  ...STANDARD_TRAINERS,
];

// ─── Encanto das Fadas (Fairy) — 60 cartas ───────────────────────────────────
const encantodasFadas: string[] = [
  // Togekiss line ×4
  'togepi',   'togepi',   'togepi',   'togepi',
  'togetic',  'togetic',  'togetic',  'togetic',
  'togekiss', 'togekiss', 'togekiss', 'togekiss',
  // Clefable line ×4
  'clefairy', 'clefairy', 'clefairy', 'clefairy',
  'clefable', 'clefable', 'clefable', 'clefable',
  // Sylveon (via Eevee) ×4
  'eevee',   'eevee',   'eevee',   'eevee',
  'sylveon', 'sylveon', 'sylveon', 'sylveon',
  // Xerneas ×4 + Gardevoir (fairy) ×4 + extras
  'xerneas',  'xerneas',  'xerneas',  'xerneas',
  'gardevoir','gardevoir','gardevoir','gardevoir',
  'togepi', 'togetic', 'clefairy', 'sylveon',
  ...STANDARD_TRAINERS,
];

// ─── Força da Natureza (Grass/Johto) — 60 cartas ─────────────────────────────
const forcaDaNatureza: string[] = [
  // Meganium line ×4
  'chikorita', 'chikorita', 'chikorita', 'chikorita',
  'bayleef',   'bayleef',   'bayleef',   'bayleef',
  'meganium',  'meganium',  'meganium',  'meganium',
  // Sceptile line ×4
  'treecko', 'treecko', 'treecko', 'treecko',
  'grovyle', 'grovyle', 'grovyle', 'grovyle',
  'sceptile','sceptile','sceptile','sceptile',
  // Celebi ×4
  'celebi', 'celebi', 'celebi', 'celebi',
  // Vileplume line ×4
  'oddish',   'oddish',   'oddish',   'oddish',
  'gloom',    'gloom',    'gloom',    'gloom',
  'vileplume','vileplume','vileplume','vileplume',
  ...STANDARD_TRAINERS,
];

// Sanity checks (run in dev)
if (chamasDaCoragem.length !== 60) {
  console.warn(`Chamas da Coragem tem ${chamasDaCoragem.length} cartas (esperado 60)`);
}
if (mentesMisteriosas.length !== 60) {
  console.warn(`Mentes Misteriosas tem ${mentesMisteriosas.length} cartas (esperado 60)`);
}
if (tempestadeEletrica.length !== 60) {
  console.warn(`Tempestade Elétrica tem ${tempestadeEletrica.length} cartas (esperado 60)`);
}
if (sombraAncestral.length !== 60) {
  console.warn(`Sombras Ancestrais tem ${sombraAncestral.length} cartas (esperado 60)`);
}
if (abismoAquatico.length !== 60) {
  console.warn(`Abismo Aquático tem ${abismoAquatico.length} cartas (esperado 60)`);
}

if (sombrasNegras.length !== 60) console.warn(`Sombras Negras tem ${sombrasNegras.length} cartas`);
if (furiaDraconica.length !== 60) console.warn(`Fúria Dracônica tem ${furiaDraconica.length} cartas`);
if (coracaoDeAco.length !== 60) console.warn(`Coração de Aço tem ${coracaoDeAco.length} cartas`);
if (encantodasFadas.length !== 60) console.warn(`Encanto das Fadas tem ${encantodasFadas.length} cartas`);
if (forcaDaNatureza.length !== 60) console.warn(`Força da Natureza tem ${forcaDaNatureza.length} cartas`);

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
  {
    id: 'sombras-ancestrais',
    name: 'Sombras Ancestrais',
    description: 'Espectros e poder psíquico com Gengar e Mewtwo. Controle total do campo com ataques devastadores.',
    cards: sombraAncestral,
  },
  {
    id: 'abismo-aquatico',
    name: 'Abismo Aquático',
    description: 'Poder aquático com Golduck, Dewgong e Vaporeon. Ataques em ondas e resistência glacial.',
    cards: abismoAquatico,
  },
  {
    id: 'sombras-negras',
    name: 'Sombras Negras',
    description: 'Trevas profundas com Tyranitar, Houndoom e Darkrai. Ataques sombrios e poder destrutivo.',
    cards: sombrasNegras,
  },
  {
    id: 'furia-draconica',
    name: 'Fúria Dracônica',
    description: 'Poder ancestral dos dragões com Dragonite, Salamence e Garchomp. Dano avassalador.',
    cards: furiaDraconica,
  },
  {
    id: 'coracao-de-aco',
    name: 'Coração de Aço',
    description: 'Defesa de aço com Metagross, Scizor e Steelix. Resistência inabalável e golpes pesados.',
    cards: coracaoDeAco,
  },
  {
    id: 'encanto-das-fadas',
    name: 'Encanto das Fadas',
    description: 'Magia fada com Togekiss, Sylveon e Xerneas. Cura constante e ataques encantadores.',
    cards: encantodasFadas,
  },
  {
    id: 'forca-da-natureza',
    name: 'Força da Natureza',
    description: 'Natureza poderosa com Meganium, Sceptile e Celebi. Cura e dano sustentado.',
    cards: forcaDaNatureza,
  },
];
