import type { PokemonCardDef, TrainerCardDef } from '../game/types';

const img = (tcgId: string) =>
  `https://images.pokemontcg.io/${tcgId.replace('-', '/')}_hires.png`;

// ─── Pokemon ───────────────────────────────────────────────────────────────────

const BASE_POKEMON_CARDS: PokemonCardDef[] = [
  // ── Fire ──
  {
    id: 'charmander', displayName: 'Charmander', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1, weakness: 'Water',
    tcgId: 'base1-46', imageUrl: img('base1-46'),
    attacks: [
      { name: 'Arranhão', cost: 1, damage: 10 },
      { name: 'Brasa', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'charmeleon', displayName: 'Charmeleon', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Charmander',
    tcgId: 'base1-24', imageUrl: img('base1-24'),
    attacks: [
      { name: 'Corte', cost: 2, damage: 30 },
      { name: 'Chama', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'charizard-ex', displayName: 'Charizard ex', type: 'pokemon',
    pokemonType: 'Fire', stage: 'ex', hp: 330, retreatCost: 2, pointValue: 3,
    weakness: 'Water',
    evolvesFrom: 'Charmeleon',
    tcgId: 'sv3pt5-6', imageUrl: img('sv3pt5-6'),
    attacks: [
      { name: 'Chama Ardente', cost: 2, damage: 60 },
      { name: 'Inferno', cost: 4, damage: 180, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'growlithe', displayName: 'Growlithe', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 70, retreatCost: 2, pointValue: 1,
    weakness: 'Water',
    tcgId: 'base4-42', imageUrl: img('base4-42'),
    attacks: [
      { name: 'Mordida', cost: 1, damage: 20 },
      { name: 'Flamethrower', cost: 3, damage: 70, effect: 'Descarte 1 energia deste Pokémon.' },
    ],
  },
  {
    id: 'arcanine', displayName: 'Arcanine', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 130, retreatCost: 3, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Growlithe',
    tcgId: 'base1-23', imageUrl: img('base1-23'),
    attacks: [
      { name: 'Tackle', cost: 2, damage: 30 },
      { name: 'Presas de Fogo', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'vulpix', displayName: 'Vulpix', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Water',
    tcgId: 'base1-68', imageUrl: img('base1-68'),
    attacks: [
      { name: 'Rabo de Fogo', cost: 1, damage: 10 },
      { name: 'Confusão', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'ninetales', displayName: 'Ninetales', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 100, retreatCost: 1, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Vulpix',
    tcgId: 'base1-12', imageUrl: img('base1-12'),
    attacks: [
      { name: 'Confiar', cost: 1, damage: 0, effect: 'Compre 3 cartas.', effectType: 'draw3' },
      { name: 'Chama Mítica', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'magmar', displayName: 'Magmar', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 70, retreatCost: 2, pointValue: 1,
    weakness: 'Water',
    tcgId: 'base1-36', imageUrl: img('base1-36'),
    attacks: [
      { name: 'Soco Ígneo', cost: 2, damage: 30 },
      { name: 'Rajada de Fogo', cost: 3, damage: 50, effect: 'Descarte 1 energia deste Pokémon.' },
    ],
  },
  {
    id: 'magmortar', displayName: 'Magmortar', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 140, retreatCost: 3, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Magmar',
    tcgId: 'dp3-31', imageUrl: img('dp3-31'),
    attacks: [
      { name: 'Explosão Magma', cost: 3, damage: 70 },
      { name: 'Canhão de Magma', cost: 5, damage: 150, effect: 'Descarte 3 energias deste Pokémon.' },
    ],
  },

  // ── Water ──
  {
    id: 'squirtle', displayName: 'Squirtle', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Electric',
    tcgId: 'base1-63', imageUrl: img('base1-63'),
    attacks: [
      { name: 'Bolha', cost: 1, damage: 10 },
      { name: 'Retirada de Concha', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'wartortle', displayName: 'Wartortle', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Squirtle',
    tcgId: 'base1-42', imageUrl: img('base1-42'),
    attacks: [
      { name: 'Jato d\'Água', cost: 1, damage: 30 },
      { name: 'Hidrocanon', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'blastoise-ex', displayName: 'Blastoise ex', type: 'pokemon',
    pokemonType: 'Water', stage: 'ex', hp: 300, retreatCost: 3, pointValue: 3,
    weakness: 'Electric',
    evolvesFrom: 'Wartortle',
    tcgId: 'sv3pt5-17', imageUrl: img('sv3pt5-17'),
    attacks: [
      { name: 'Aqua Canhão', cost: 3, damage: 80 },
      { name: 'Hidrocanão Supremo', cost: 5, damage: 200 },
    ],
  },

  // ── Grass ──
  {
    id: 'bulbasaur', displayName: 'Bulbasaur', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'base1-44', imageUrl: img('base1-44'),
    attacks: [
      { name: 'Chicote de Vinha', cost: 1, damage: 10 },
      { name: 'Pó de Veneno', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'ivysaur', displayName: 'Ivysaur', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Bulbasaur',
    tcgId: 'base1-30', imageUrl: img('base1-30'),
    attacks: [
      { name: 'Chicote de Vinha', cost: 2, damage: 30 },
      { name: 'Pétalas Cortantes', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'venusaur-ex', displayName: 'Venusaur ex', type: 'pokemon',
    pokemonType: 'Grass', stage: 'ex', hp: 310, retreatCost: 3, pointValue: 3,
    weakness: 'Fire',
    evolvesFrom: 'Ivysaur',
    tcgId: 'sv3pt5-4', imageUrl: img('sv3pt5-4'),
    attacks: [
      { name: 'Pétala Solar', cost: 3, damage: 70, effect: 'Cure 30 de dano deste Pokémon.' },
      { name: 'Solarbeam', cost: 5, damage: 220 },
    ],
  },
  {
    id: 'oddish', displayName: 'Oddish', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'base2-57', imageUrl: img('base2-57'),
    attacks: [
      { name: 'Pó Adormecedor', cost: 1, damage: 10 },
      { name: 'Absorver', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'gloom', displayName: 'Gloom', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage1', hp: 70, retreatCost: 2, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Oddish',
    tcgId: 'base2-38', imageUrl: img('base2-38'),
    attacks: [
      { name: 'Fedor', cost: 1, damage: 0, effect: 'O Pokémon atacante desta rodada perde 20 de dano.', effectType: 'weaken-attacker' },
      { name: 'Pétalas Acres', cost: 3, damage: 50 },
    ],
  },
  {
    id: 'vileplume', displayName: 'Vileplume', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage2', hp: 120, retreatCost: 2, pointValue: 3,
    weakness: 'Fire',
    evolvesFrom: 'Gloom',
    tcgId: 'base2-15', imageUrl: img('base2-15'),
    attacks: [
      { name: 'Pó de Esporos', cost: 2, damage: 30 },
      { name: 'Pétala Solar', cost: 4, damage: 100, effect: 'Cure 30 de dano deste Pokémon.' },
    ],
  },

  // ── Electric ──
  {
    id: 'pikachu', displayName: 'Pikachu', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base1-58', imageUrl: img('base1-58'),
    attacks: [
      { name: 'Thundershock', cost: 1, damage: 10 },
      { name: 'Raio', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'raichu', displayName: 'Raichu', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Pikachu',
    tcgId: 'base1-14', imageUrl: img('base1-14'),
    attacks: [
      { name: 'Faísca', cost: 2, damage: 40 },
      { name: 'Raio Trovão', cost: 4, damage: 120 },
    ],
  },
  {
    id: 'magnemite', displayName: 'Magnemite', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base1-53', imageUrl: img('base1-53'),
    attacks: [
      { name: 'Thundershock', cost: 1, damage: 10 },
      { name: 'Sônico', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'magneton', displayName: 'Magneton', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Stage1', hp: 80, retreatCost: 1, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Magnemite',
    tcgId: 'base1-9', imageUrl: img('base1-9'),
    attacks: [
      { name: 'Sônico', cost: 2, damage: 20 },
      { name: 'Eletrocanon', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'luxray', displayName: 'Luxray', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Stage2', hp: 130, retreatCost: 2, pointValue: 3,
    weakness: 'Fighting',
    evolvesFrom: 'Magneton',
    tcgId: 'dp1-7', imageUrl: img('dp1-7'),
    attacks: [
      { name: 'Mordida Elétrica', cost: 3, damage: 60 },
      { name: 'Relâmpago', cost: 4, damage: 100 },
    ],
  },

  // ── Psychic ──
  {
    id: 'ralts', displayName: 'Ralts', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'sv1-84', imageUrl: img('sv1-84'),
    attacks: [
      { name: 'Ondas Psíquicas', cost: 1, damage: 10 },
      { name: 'Confundir', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'kirlia', displayName: 'Kirlia', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage1', hp: 70, retreatCost: 1, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Ralts',
    tcgId: 'sv1-85', imageUrl: img('sv1-85'),
    attacks: [
      { name: 'Onda Psíquica', cost: 2, damage: 20 },
      { name: 'Psíquico', cost: 3, damage: 50, effect: 'Causa 10 a mais por energia no alvo.' },
    ],
  },
  {
    id: 'gardevoir-ex', displayName: 'Gardevoir ex', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'ex', hp: 310, retreatCost: 2, pointValue: 3,
    weakness: 'Psychic',
    evolvesFrom: 'Kirlia',
    tcgId: 'sv1-86', imageUrl: img('sv1-86'),
    ability: {
      name: 'Psíquico Amplificado',
      category: 'A',
      text: 'Os ataques deste Pokémon causam 30 a mais de dano para cada energia no Energy Pool do oponente.',
    },
    attacks: [
      { name: 'Psico-abraço', cost: 3, damage: 60 },
      { name: 'Moonblast', cost: 4, damage: 130 },
    ],
  },
  {
    id: 'abra', displayName: 'Abra', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base1-43', imageUrl: img('base1-43'),
    attacks: [
      { name: 'Teletransporte', cost: 1, damage: 0, effect: 'Troque este Pokémon com um da sua mão (se houver). O novo Pokémon entra pronto.', effectType: 'teleport' },
      { name: 'Confusão', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'kadabra', displayName: 'Kadabra', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage1', hp: 80, retreatCost: 2, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Abra',
    tcgId: 'base1-32', imageUrl: img('base1-32'),
    attacks: [
      { name: 'Psíquico', cost: 2, damage: 30 },
      { name: 'Super Psíquico', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'alakazam', displayName: 'Alakazam', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage2', hp: 130, retreatCost: 2, pointValue: 3,
    weakness: 'Psychic',
    evolvesFrom: 'Kadabra',
    tcgId: 'base1-1', imageUrl: img('base1-1'),
    ability: {
      name: 'Transferência de Dano',
      category: 'A',
      text: 'Uma vez no seu turno, mova 1 dano de qualquer Pokémon seu para qualquer outro Pokémon em jogo.',
    },
    attacks: [
      { name: 'Psicorrasa', cost: 3, damage: 60 },
      { name: 'Psíquico Supremo', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'mew', displayName: 'Mew', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'cel25-11', imageUrl: img('cel25-11'),
    ability: {
      name: 'Baú de DNA',
      category: 'B',
      text: 'Uma vez no seu turno, você pode usar o ataque de qualquer Pokémon em jogo (pague o custo normalmente).',
    },
    attacks: [
      { name: 'Telepatia', cost: 2, damage: 30 },
    ],
  },

  // ── Fighting ──
  {
    id: 'machop', displayName: 'Machop', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Basic', hp: 70, retreatCost: 2, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base1-52', imageUrl: img('base1-52'),
    attacks: [
      { name: 'Murro Baixo', cost: 1, damage: 20 },
      { name: 'Karatê', cost: 2, damage: 40 },
    ],
  },
  {
    id: 'machoke', displayName: 'Machoke', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Stage1', hp: 100, retreatCost: 3, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Machop',
    tcgId: 'base1-34', imageUrl: img('base1-34'),
    attacks: [
      { name: 'Murro', cost: 2, damage: 40 },
      { name: 'Ataque Brutal', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'machamp', displayName: 'Machamp', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Stage2', hp: 160, retreatCost: 3, pointValue: 3,
    weakness: 'Psychic',
    evolvesFrom: 'Machoke',
    tcgId: 'base1-8', imageUrl: img('base1-8'),
    attacks: [
      { name: 'Golpe Duplo', cost: 2, damage: 30, damageText: '30×2', effect: 'Ataque duas vezes.' },
      { name: 'Soco Supremo', cost: 4, damage: 130 },
    ],
  },
  {
    id: 'riolu', displayName: 'Riolu', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'dp2-68', imageUrl: img('dp2-68'),
    attacks: [
      { name: 'Murro Rápido', cost: 1, damage: 10 },
      { name: 'Jab', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'lucario', displayName: 'Lucario', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Riolu',
    tcgId: 'dp1-5', imageUrl: img('dp1-5'),
    attacks: [
      { name: 'Ondas de Aura', cost: 2, damage: 30 },
      { name: 'Esfera de Aura', cost: 3, damage: 80 },
    ],
  },

  // ── Normal ──
  {
    id: 'eevee', displayName: 'Eevee', type: 'pokemon',
    pokemonType: 'Normal', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base2-51', imageUrl: img('base2-51'),
    attacks: [
      { name: 'Tackle', cost: 1, damage: 10 },
      { name: 'Areia nos Olhos', cost: 2, damage: 20, effect: 'O próximo ataque do oponente causa 20 a menos de dano.' },
    ],
  },
  {
    id: 'snorlax', displayName: 'Snorlax', type: 'pokemon',
    pokemonType: 'Normal', stage: 'Basic', hp: 150, retreatCost: 4, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base2-11', imageUrl: img('base2-11'),
    attacks: [
      { name: 'Barriga de Aço', cost: 1, damage: 0, effect: 'Previne 30 de dano recebido neste turno.', effectType: 'shield30' },
      { name: 'Body Slam', cost: 4, damage: 90 },
    ],
  },
  {
    id: 'pidgey', displayName: 'Pidgey', type: 'pokemon',
    pokemonType: 'Normal', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base2-46', imageUrl: img('base2-46'),
    attacks: [
      { name: 'Rajada', cost: 1, damage: 10 },
      { name: 'Investida', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'pidgeotto', displayName: 'Pidgeotto', type: 'pokemon',
    pokemonType: 'Normal', stage: 'Stage1', hp: 80, retreatCost: 1, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Pidgey',
    tcgId: 'base1-22', imageUrl: img('base1-22'),
    attacks: [
      { name: 'Investida', cost: 2, damage: 30 },
      { name: 'Ventania', cost: 3, damage: 50 },
    ],
  },
  {
    id: 'pidgeot-ex', displayName: 'Pidgeot ex', type: 'pokemon',
    pokemonType: 'Normal', stage: 'ex', hp: 280, retreatCost: 1, pointValue: 3,
    weakness: 'Fighting',
    evolvesFrom: 'Pidgeotto',
    tcgId: 'sv3pt5-38', imageUrl: img('sv3pt5-38'),
    ability: {
      name: 'Busca Veloz',
      category: 'B',
      text: 'Uma vez no seu turno, você pode procurar qualquer carta no seu deck e adicioná-la à sua mão. Embaralhe o deck.',
    },
    attacks: [
      { name: 'Ventania Suprema', cost: 2, damage: 60 },
      { name: 'Asa de Aço', cost: 3, damage: 120 },
    ],
  },
  {
    id: 'bibarel', displayName: 'Bibarel', type: 'pokemon',
    pokemonType: 'Normal', stage: 'Stage1', hp: 100, retreatCost: 3, pointValue: 2,
    weakness: 'Fighting',
    tcgId: 'brs-121', imageUrl: img('brs-121'),
    ability: {
      name: 'Incisivos Industriosos',
      category: 'B',
      text: 'Uma vez no seu turno, você pode comprar cartas até ter 5 na mão.',
    },
    attacks: [
      { name: 'Mordida Forte', cost: 3, damage: 60 },
    ],
  },

  // ── Electric (extra) ──
  {
    id: 'electabuzz', displayName: 'Electabuzz', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 70, retreatCost: 2, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base1-20', imageUrl: img('base1-20'),
    attacks: [
      { name: 'Thunderpunch', cost: 2, damage: 30 },
      { name: 'Raio Duplo', cost: 3, damage: 50 },
    ],
  },
  {
    id: 'electivire', displayName: 'Electivire', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Stage1', hp: 140, retreatCost: 3, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Electabuzz',
    tcgId: 'dp3-4', imageUrl: img('dp3-4'),
    attacks: [
      { name: 'Choque Motor', cost: 3, damage: 70 },
      { name: 'Motor Drive', cost: 5, damage: 150, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'zapdos', displayName: 'Zapdos', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 90, retreatCost: 3, pointValue: 2,
    weakness: 'Fighting',
    tcgId: 'base1-16', imageUrl: img('base1-16'),
    attacks: [
      { name: 'Trovão', cost: 2, damage: 40 },
      { name: 'Tempestade Elétrica', cost: 4, damage: 100, effect: 'Este Pokémon fica vulnerável depois de atacar.' },
    ],
  },

  // ── Fire (extra) ──
  {
    id: 'ponyta', displayName: 'Ponyta', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Water',
    tcgId: 'base1-60', imageUrl: img('base1-60'),
    attacks: [
      { name: 'Brasa', cost: 1, damage: 30 },
    ],
  },

  // ── Ghost / Psychic (for Sombras deck) ──
  {
    id: 'gastly', displayName: 'Gastly', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 30, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'sv3pt5-92', imageUrl: img('sv3pt5-92'),
    attacks: [
      { name: 'Hipnose', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'haunter', displayName: 'Haunter', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage1', hp: 60, retreatCost: 1, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Gastly',
    tcgId: 'sv3pt5-93', imageUrl: img('sv3pt5-93'),
    attacks: [
      { name: 'Sonho Mau', cost: 1, damage: 20 },
      { name: 'Assombrar', cost: 2, damage: 40 },
    ],
  },
  {
    id: 'gengar', displayName: 'Gengar', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage2', hp: 130, retreatCost: 2, pointValue: 3,
    weakness: 'Psychic',
    evolvesFrom: 'Haunter',
    tcgId: 'sv3pt5-94', imageUrl: img('sv3pt5-94'),
    attacks: [
      { name: 'Maldição', cost: 2, damage: 60 },
      { name: 'Pesadelo', cost: 3, damage: 100 },
    ],
  },
  {
    id: 'drowzee', displayName: 'Drowzee', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 60, retreatCost: 2, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'sv3pt5-96', imageUrl: img('sv3pt5-96'),
    attacks: [
      { name: 'Psíquico', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'hypno', displayName: 'Hypno', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Drowzee',
    tcgId: 'sv3pt5-97', imageUrl: img('sv3pt5-97'),
    attacks: [
      { name: 'Hipnose', cost: 2, damage: 30 },
      { name: 'Pesadelo Profundo', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'mewtwo', displayName: 'Mewtwo', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 130, retreatCost: 3, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base1-10', imageUrl: img('base1-10'),
    attacks: [
      { name: 'Psicoataque', cost: 2, damage: 50 },
      { name: 'Psíquico Supremo', cost: 4, damage: 130 },
    ],
  },
  {
    id: 'mr-mime', displayName: 'Mr. Mime', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 70, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base2-6', imageUrl: img('base2-6'),
    attacks: [
      { name: 'Confusão', cost: 1, damage: 20 },
      { name: 'Psíquico', cost: 2, damage: 40 },
    ],
  },
  {
    id: 'jynx', displayName: 'Jynx', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 70, retreatCost: 2, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'sv3pt5-124', imageUrl: img('sv3pt5-124'),
    attacks: [
      { name: 'Abraço Gelado', cost: 2, damage: 30 },
      { name: 'Cantiga de Ninar', cost: 3, damage: 50 },
    ],
  },

  // ── Water (for Abismo deck) ──
  {
    id: 'psyduck', displayName: 'Psyduck', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Electric',
    tcgId: 'sv3pt5-54', imageUrl: img('sv3pt5-54'),
    attacks: [
      { name: 'Dor de Cabeça', cost: 1, damage: 10 },
      { name: 'Confusão', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'golduck', displayName: 'Golduck', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 100, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Psyduck',
    tcgId: 'sv3pt5-55', imageUrl: img('sv3pt5-55'),
    attacks: [
      { name: 'Hidrocanão', cost: 2, damage: 50 },
      { name: 'Telecinese Aquática', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'horsea', displayName: 'Horsea', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Electric',
    tcgId: 'sv3pt5-116', imageUrl: img('sv3pt5-116'),
    attacks: [
      { name: 'Bolha', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'seadra', displayName: 'Seadra', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Horsea',
    tcgId: 'sv3pt5-117', imageUrl: img('sv3pt5-117'),
    attacks: [
      { name: "Jato d'Água", cost: 2, damage: 40 },
      { name: 'Hidrocanão', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'seel', displayName: 'Seel', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 60, retreatCost: 2, pointValue: 1,
    weakness: 'Electric',
    tcgId: 'sv3pt5-86', imageUrl: img('sv3pt5-86'),
    attacks: [
      { name: 'Lança-Gelo', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'dewgong', displayName: 'Dewgong', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 90, retreatCost: 3, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Seel',
    tcgId: 'sv3pt5-87', imageUrl: img('sv3pt5-87'),
    attacks: [
      { name: 'Cauda Gelada', cost: 2, damage: 40 },
      { name: 'Aurora Gelada', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'lapras', displayName: 'Lapras', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 100, retreatCost: 3, pointValue: 2,
    weakness: 'Electric',
    tcgId: 'sv3pt5-131', imageUrl: img('sv3pt5-131'),
    attacks: [
      { name: 'Remoinho de Água', cost: 2, damage: 40 },
      { name: 'Frio Glacial', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'slowbro', displayName: 'Slowbro', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Stage1', hp: 110, retreatCost: 3, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Slowpoke',
    tcgId: 'sv3pt5-80', imageUrl: img('sv3pt5-80'),
    attacks: [
      { name: 'Psíquico', cost: 2, damage: 50 },
      { name: 'Confusão Total', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'vaporeon', displayName: 'Vaporeon', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Eevee',
    tcgId: 'base2-12', imageUrl: img('base2-12'),
    attacks: [
      { name: 'Bolha de Água', cost: 2, damage: 40 },
      { name: 'Hidrocanão', cost: 3, damage: 80 },
    ],
  },

  // ── Psychic (extra) ──
  {
    id: 'jigglypuff', displayName: 'Jigglypuff', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base2-54', imageUrl: img('base2-54'),
    attacks: [
      { name: 'Soco', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'slowpoke', displayName: 'Slowpoke', type: 'pokemon',
    pokemonType: 'Psychic', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'fossil-55', imageUrl: img('fossil-55'),
    attacks: [
      { name: 'Cabeçada', cost: 1, damage: 20 },
    ],
  },

  // ── Electric (extra) ──
  {
    id: 'voltorb', displayName: 'Voltorb', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 40, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'base1-67', imageUrl: img('base1-67'),
    attacks: [
      { name: 'Encontrão', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'electrode', displayName: 'Electrode', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Stage1', hp: 90, retreatCost: 1, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Voltorb',
    tcgId: 'base1-21', imageUrl: img('base1-21'),
    attacks: [
      { name: 'Choque', cost: 2, damage: 40 },
      { name: 'Explosão', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'mareep', displayName: 'Mareep', type: 'pokemon',
    pokemonType: 'Electric', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'neo1-56', imageUrl: img('neo1-56'),
    attacks: [
      { name: 'Trovãozinho', cost: 1, damage: 20 },
    ],
  },
];

// ─── Dark ──────────────────────────────────────────────────────────────────────
const DARK_CARDS: PokemonCardDef[] = [
  {
    id: 'sneasel', displayName: 'Sneasel', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'neo1-25', imageUrl: img('neo1-25'),
    attacks: [
      { name: 'Garra Afiada', cost: 1, damage: 20 },
      { name: 'Furtividade', cost: 2, damage: 40 },
    ],
  },
  {
    id: 'weavile', displayName: 'Weavile', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Stage1', hp: 90, retreatCost: 1, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Sneasel',
    tcgId: 'dp3-40', imageUrl: img('dp3-40'),
    attacks: [
      { name: 'Golpe Noturno', cost: 2, damage: 40 },
      { name: 'Faca de Gelo', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'houndour', displayName: 'Houndour', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'neo2-49', imageUrl: img('neo2-49'),
    attacks: [
      { name: 'Mordida', cost: 1, damage: 20 },
      { name: 'Brasa Sombria', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'houndoom', displayName: 'Houndoom', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Houndour',
    tcgId: 'neo2-8', imageUrl: img('neo2-8'),
    attacks: [
      { name: 'Chama Negra', cost: 2, damage: 50 },
      { name: 'Pesadelo Infernal', cost: 4, damage: 120, effect: 'Descarte 1 energia deste Pokémon.' },
    ],
  },
  {
    id: 'umbreon', displayName: 'Umbreon', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Eevee',
    tcgId: 'neo1-13', imageUrl: img('neo1-13'),
    attacks: [
      { name: 'Mordida Lunar', cost: 2, damage: 50 },
      { name: 'Voz Perturbadora', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'murkrow', displayName: 'Murkrow', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fighting',
    tcgId: 'neo1-17', imageUrl: img('neo1-17'),
    attacks: [
      { name: 'Investida', cost: 1, damage: 20 },
      { name: 'Caos', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'honchkrow', displayName: 'Honchkrow', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Stage1', hp: 120, retreatCost: 2, pointValue: 2,
    weakness: 'Fighting',
    evolvesFrom: 'Murkrow',
    tcgId: 'dp1-10', imageUrl: img('dp1-10'),
    attacks: [
      { name: 'Noite Escura', cost: 2, damage: 50 },
      { name: 'Comando Sombrio', cost: 3, damage: 90 },
    ],
  },
  {
    id: 'darkrai', displayName: 'Darkrai', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Basic', hp: 120, retreatCost: 2, pointValue: 2,
    weakness: 'Fighting',
    tcgId: 'dp3-3', imageUrl: img('dp3-3'),
    attacks: [
      { name: 'Sonho Negro', cost: 2, damage: 40 },
      { name: 'Medo Noturno', cost: 4, damage: 110 },
    ],
  },
  {
    id: 'tyranitar', displayName: 'Tyranitar', type: 'pokemon',
    pokemonType: 'Dark', stage: 'Stage2', hp: 180, retreatCost: 4, pointValue: 3,
    weakness: 'Fighting',
    evolvesFrom: 'Pupitar',
    tcgId: 'neo2-11', imageUrl: img('neo2-11'),
    attacks: [
      { name: 'Destruição', cost: 3, damage: 80 },
      { name: 'Tempestade de Areia', cost: 5, damage: 150, effect: 'Causa 20 a todos os Pokémon do banco.' },
    ],
  },
  {
    id: 'larvitar', displayName: 'Larvitar', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'neo2-52', imageUrl: img('neo2-52'),
    attacks: [
      { name: 'Mordida', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'pupitar', displayName: 'Pupitar', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Stage1', hp: 90, retreatCost: 3, pointValue: 2,
    weakness: 'Psychic',
    evolvesFrom: 'Larvitar',
    tcgId: 'neo2-36', imageUrl: img('neo2-36'),
    attacks: [
      { name: 'Slam', cost: 2, damage: 40 },
      { name: 'Corpo de Rocha', cost: 3, damage: 60 },
    ],
  },
];

// ─── Dragon ────────────────────────────────────────────────────────────────────
const DRAGON_CARDS: PokemonCardDef[] = [
  {
    id: 'dratini', displayName: 'Dratini', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fairy',
    tcgId: 'base2-26', imageUrl: img('base2-26'),
    attacks: [
      { name: 'Envolver', cost: 1, damage: 10 },
      { name: 'Slam', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'dragonair', displayName: 'Dragonair', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Fairy',
    evolvesFrom: 'Dratini',
    tcgId: 'base2-23', imageUrl: img('base2-23'),
    attacks: [
      { name: 'Agitar', cost: 2, damage: 40 },
      { name: 'Pulso do Dragão', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'dragonite', displayName: 'Dragonite', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage2', hp: 180, retreatCost: 3, pointValue: 3,
    weakness: 'Fairy',
    evolvesFrom: 'Dragonair',
    tcgId: 'base2-4', imageUrl: img('base2-4'),
    attacks: [
      { name: 'Vento do Dragão', cost: 3, damage: 80 },
      { name: 'Praga do Dragão', cost: 5, damage: 180, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'bagon', displayName: 'Bagon', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fairy',
    tcgId: 'ex7-27', imageUrl: img('ex7-27'),
    attacks: [
      { name: 'Mordida', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'shelgon', displayName: 'Shelgon', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage1', hp: 80, retreatCost: 3, pointValue: 2,
    weakness: 'Fairy',
    evolvesFrom: 'Bagon',
    tcgId: 'ex7-40', imageUrl: img('ex7-40'),
    attacks: [
      { name: 'Escudo de Dragão', cost: 2, damage: 30 },
      { name: 'Investida Feroz', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'salamence', displayName: 'Salamence', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage2', hp: 170, retreatCost: 3, pointValue: 3,
    weakness: 'Fairy',
    evolvesFrom: 'Shelgon',
    tcgId: 'ex7-9', imageUrl: img('ex7-9'),
    attacks: [
      { name: 'Chama Dracônica', cost: 3, damage: 90 },
      { name: 'Frenesi', cost: 5, damage: 160 },
    ],
  },
  {
    id: 'gible', displayName: 'Gible', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Fairy',
    tcgId: 'dp5-71', imageUrl: img('dp5-71'),
    attacks: [
      { name: 'Morder', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'gabite', displayName: 'Gabite', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Fairy',
    evolvesFrom: 'Gible',
    tcgId: 'dp5-36', imageUrl: img('dp5-36'),
    attacks: [
      { name: 'Corte Dragon', cost: 2, damage: 40 },
      { name: 'Fenda', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'garchomp', displayName: 'Garchomp', type: 'pokemon',
    pokemonType: 'Dragon', stage: 'Stage2', hp: 170, retreatCost: 2, pointValue: 3,
    weakness: 'Fairy',
    evolvesFrom: 'Gabite',
    tcgId: 'dp5-5', imageUrl: img('dp5-5'),
    attacks: [
      { name: 'Golpe de Garra', cost: 3, damage: 100 },
      { name: 'Ataque Sonic', cost: 4, damage: 160 },
    ],
  },
];

// ─── Metal ─────────────────────────────────────────────────────────────────────
const METAL_CARDS: PokemonCardDef[] = [
  {
    id: 'beldum', displayName: 'Beldum', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Basic', hp: 50, retreatCost: 3, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'ex6-55', imageUrl: img('ex6-55'),
    attacks: [
      { name: 'Cabeçada Metálica', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'metang', displayName: 'Metang', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Stage1', hp: 90, retreatCost: 3, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Beldum',
    tcgId: 'ex6-40', imageUrl: img('ex6-40'),
    attacks: [
      { name: 'Golpe de Aço', cost: 2, damage: 40 },
      { name: 'Psíquico', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'metagross', displayName: 'Metagross', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Stage2', hp: 160, retreatCost: 4, pointValue: 3,
    weakness: 'Fire',
    evolvesFrom: 'Metang',
    tcgId: 'ex6-11', imageUrl: img('ex6-11'),
    attacks: [
      { name: 'Canhão Metálico', cost: 3, damage: 80 },
      { name: 'Psicocanhão', cost: 5, damage: 170 },
    ],
  },
  {
    id: 'scyther', displayName: 'Scyther', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Basic', hp: 70, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'base1-26', imageUrl: img('base1-26'),
    attacks: [
      { name: 'Corte de Foice', cost: 1, damage: 30 },
      { name: 'Fúria de Cortes', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'scizor', displayName: 'Scizor', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Stage1', hp: 120, retreatCost: 2, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Scyther',
    tcgId: 'neo1-10', imageUrl: img('neo1-10'),
    attacks: [
      { name: 'Pinça de Aço', cost: 2, damage: 50 },
      { name: 'Corte Metálico', cost: 3, damage: 90 },
    ],
  },
  {
    id: 'steelix', displayName: 'Steelix', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Stage1', hp: 150, retreatCost: 4, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Onix',
    tcgId: 'neo1-11', imageUrl: img('neo1-11'),
    attacks: [
      { name: 'Cauda de Aço', cost: 2, damage: 50 },
      { name: 'Slam de Ferro', cost: 4, damage: 110 },
    ],
  },
  {
    id: 'onix', displayName: 'Onix', type: 'pokemon',
    pokemonType: 'Fighting', stage: 'Basic', hp: 90, retreatCost: 3, pointValue: 1,
    weakness: 'Psychic',
    tcgId: 'base1-56', imageUrl: img('base1-56'),
    attacks: [
      { name: 'Tackle', cost: 1, damage: 20 },
      { name: 'Investida de Pedra', cost: 3, damage: 50 },
    ],
  },
  {
    id: 'skarmory', displayName: 'Skarmory', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Basic', hp: 80, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'neo2-20', imageUrl: img('neo2-20'),
    attacks: [
      { name: 'Asa de Aço', cost: 1, damage: 20 },
      { name: 'Corte de Lâmina', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'jirachi', displayName: 'Jirachi', type: 'pokemon',
    pokemonType: 'Metal', stage: 'Basic', hp: 70, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'ex6-9', imageUrl: img('ex6-9'),
    ability: {
      name: 'Desejo Estelar',
      category: 'B',
      text: 'Uma vez no seu turno, você pode comprar 1 carta extra.',
    },
    attacks: [
      { name: 'Poeira Estelar', cost: 2, damage: 30 },
      { name: 'Meteor Mash', cost: 3, damage: 70 },
    ],
  },
];

// ─── Fairy ─────────────────────────────────────────────────────────────────────
const FAIRY_CARDS: PokemonCardDef[] = [
  {
    id: 'clefairy', displayName: 'Clefairy', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Basic', hp: 60, retreatCost: 1, pointValue: 1,
    weakness: 'Metal',
    tcgId: 'base1-5', imageUrl: img('base1-5'),
    attacks: [
      { name: 'Metronome', cost: 1, damage: 10 },
      { name: 'Moonblast', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'clefable', displayName: 'Clefable', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Stage1', hp: 100, retreatCost: 2, pointValue: 2,
    weakness: 'Metal',
    evolvesFrom: 'Clefairy',
    tcgId: 'base2-1', imageUrl: img('base2-1'),
    attacks: [
      { name: 'Lunar', cost: 2, damage: 40 },
      { name: 'Fada Suprema', cost: 4, damage: 100 },
    ],
  },
  {
    id: 'togepi', displayName: 'Togepi', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Basic', hp: 40, retreatCost: 1, pointValue: 1,
    weakness: 'Metal',
    tcgId: 'neo1-52', imageUrl: img('neo1-52'),
    attacks: [
      { name: 'Encanto', cost: 1, damage: 10 },
    ],
  },
  {
    id: 'togetic', displayName: 'Togetic', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Stage1', hp: 70, retreatCost: 1, pointValue: 2,
    weakness: 'Metal',
    evolvesFrom: 'Togepi',
    tcgId: 'neo1-28', imageUrl: img('neo1-28'),
    attacks: [
      { name: 'Brisa de Fadas', cost: 1, damage: 20 },
      { name: 'Asa Divina', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'togekiss', displayName: 'Togekiss', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Stage2', hp: 140, retreatCost: 2, pointValue: 3,
    weakness: 'Metal',
    evolvesFrom: 'Togetic',
    tcgId: 'dp4-11', imageUrl: img('dp4-11'),
    attacks: [
      { name: 'Encanto Sereno', cost: 2, damage: 0, effect: 'Cure 60 de dano deste Pokémon.', effectType: 'healself60' },
      { name: 'Ar Gracioso', cost: 4, damage: 120 },
    ],
  },
  {
    id: 'sylveon', displayName: 'Sylveon', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Metal',
    evolvesFrom: 'Eevee',
    tcgId: 'xy1-72', imageUrl: img('xy1-72'),
    attacks: [
      { name: 'Fita Encantada', cost: 2, damage: 40 },
      { name: 'Moonblast', cost: 3, damage: 90 },
    ],
  },
  {
    id: 'gardevoir', displayName: 'Gardevoir', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Stage1', hp: 110, retreatCost: 2, pointValue: 2,
    weakness: 'Metal',
    evolvesFrom: 'Kirlia',
    tcgId: 'ex1-7', imageUrl: img('ex1-7'),
    attacks: [
      { name: 'Psíquico', cost: 2, damage: 40 },
      { name: 'Moonblast', cost: 3, damage: 80 },
    ],
  },
  {
    id: 'xerneas', displayName: 'Xerneas', type: 'pokemon',
    pokemonType: 'Fairy', stage: 'Basic', hp: 130, retreatCost: 2, pointValue: 2,
    weakness: 'Metal',
    tcgId: 'xy1-96', imageUrl: img('xy1-96'),
    attacks: [
      { name: 'Geo Control', cost: 2, damage: 30 },
      { name: 'Carga Fada', cost: 4, damage: 120 },
    ],
  },
];

// ─── Grass (Johto/Hoenn) ───────────────────────────────────────────────────────
const GRASS_EXTRA: PokemonCardDef[] = [
  {
    id: 'chikorita', displayName: 'Chikorita', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'neo1-44', imageUrl: img('neo1-44'),
    attacks: [
      { name: 'Chicote de Folha', cost: 1, damage: 10 },
      { name: 'Pétala Doce', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'bayleef', displayName: 'Bayleef', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage1', hp: 80, retreatCost: 2, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Chikorita',
    tcgId: 'neo1-18', imageUrl: img('neo1-18'),
    attacks: [
      { name: 'Chicote de Vinha', cost: 2, damage: 30 },
      { name: 'Lança de Folha', cost: 3, damage: 60 },
    ],
  },
  {
    id: 'meganium', displayName: 'Meganium', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage2', hp: 160, retreatCost: 3, pointValue: 3,
    weakness: 'Fire',
    evolvesFrom: 'Bayleef',
    tcgId: 'neo1-8', imageUrl: img('neo1-8'),
    attacks: [
      { name: 'Pétala Solar', cost: 3, damage: 70, effect: 'Cure 40 de dano deste Pokémon.' },
      { name: 'Solarbeam', cost: 5, damage: 180 },
    ],
  },
  {
    id: 'treecko', displayName: 'Treecko', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'ex4-74', imageUrl: img('ex4-74'),
    attacks: [
      { name: 'Arranhão', cost: 1, damage: 10 },
      { name: 'Chicote', cost: 2, damage: 20 },
    ],
  },
  {
    id: 'grovyle', displayName: 'Grovyle', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage1', hp: 80, retreatCost: 1, pointValue: 2,
    weakness: 'Fire',
    evolvesFrom: 'Treecko',
    tcgId: 'ex4-36', imageUrl: img('ex4-36'),
    attacks: [
      { name: 'Corte de Folha', cost: 2, damage: 40 },
      { name: 'Lâmina Herbácea', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'sceptile', displayName: 'Sceptile', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Stage2', hp: 150, retreatCost: 1, pointValue: 3,
    weakness: 'Fire',
    evolvesFrom: 'Grovyle',
    tcgId: 'ex4-11', imageUrl: img('ex4-11'),
    attacks: [
      { name: 'Estalo de Folha', cost: 2, damage: 60 },
      { name: 'Mega Lança', cost: 4, damage: 140 },
    ],
  },
  {
    id: 'celebi', displayName: 'Celebi', type: 'pokemon',
    pokemonType: 'Grass', stage: 'Basic', hp: 70, retreatCost: 1, pointValue: 1,
    weakness: 'Fire',
    tcgId: 'neo1-16', imageUrl: img('neo1-16'),
    attacks: [
      { name: 'Cura Natural', cost: 1, damage: 0, effect: 'Cure 30 de dano deste Pokémon.', effectType: 'healself30' },
      { name: 'Viagem no Tempo', cost: 3, damage: 50 },
    ],
  },
];

// ─── Fire (Johto/Hoenn) ────────────────────────────────────────────────────────
const FIRE_EXTRA: PokemonCardDef[] = [
  {
    id: 'cyndaquil', displayName: 'Cyndaquil', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Water',
    tcgId: 'neo1-46', imageUrl: img('neo1-46'),
    attacks: [
      { name: 'Brasinha', cost: 1, damage: 10 },
      { name: 'Brasa', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'quilava', displayName: 'Quilava', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 80, retreatCost: 2, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Cyndaquil',
    tcgId: 'neo1-22', imageUrl: img('neo1-22'),
    attacks: [
      { name: 'Chama', cost: 2, damage: 40 },
      { name: 'Explosão de Fogo', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'typhlosion', displayName: 'Typhlosion', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage2', hp: 160, retreatCost: 3, pointValue: 3,
    weakness: 'Water',
    evolvesFrom: 'Quilava',
    tcgId: 'neo1-17', imageUrl: img('neo1-17'),
    attacks: [
      { name: 'Erupção', cost: 3, damage: 90 },
      { name: 'Inferno de Chamas', cost: 5, damage: 180, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'torchic', displayName: 'Torchic', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Water',
    tcgId: 'ex4-75', imageUrl: img('ex4-75'),
    attacks: [
      { name: 'Foco de Brasa', cost: 1, damage: 20 },
    ],
  },
  {
    id: 'combusken', displayName: 'Combusken', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage1', hp: 90, retreatCost: 2, pointValue: 2,
    weakness: 'Water',
    evolvesFrom: 'Torchic',
    tcgId: 'ex4-29', imageUrl: img('ex4-29'),
    attacks: [
      { name: 'Chute de Brasa', cost: 2, damage: 40 },
      { name: 'Fogo Lutador', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'blaziken', displayName: 'Blaziken', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Stage2', hp: 160, retreatCost: 2, pointValue: 3,
    weakness: 'Water',
    evolvesFrom: 'Combusken',
    tcgId: 'ex4-3', imageUrl: img('ex4-3'),
    attacks: [
      { name: 'Chute Flamejante', cost: 3, damage: 90 },
      { name: 'Inferno de Chutes', cost: 5, damage: 180, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'ho-oh', displayName: 'Ho-Oh', type: 'pokemon',
    pokemonType: 'Fire', stage: 'Basic', hp: 130, retreatCost: 3, pointValue: 2,
    weakness: 'Water',
    tcgId: 'neo2-9', imageUrl: img('neo2-9'),
    attacks: [
      { name: 'Sagrado Fogo', cost: 3, damage: 80 },
      { name: 'Fênix Ardente', cost: 5, damage: 150, effect: 'Cure 30 de dano deste Pokémon.' },
    ],
  },
];

// ─── Water (Johto) ─────────────────────────────────────────────────────────────
const WATER_EXTRA: PokemonCardDef[] = [
  {
    id: 'totodile', displayName: 'Totodile', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 50, retreatCost: 1, pointValue: 1,
    weakness: 'Electric',
    tcgId: 'neo1-53', imageUrl: img('neo1-53'),
    attacks: [
      { name: 'Mordida', cost: 1, damage: 20 },
      { name: 'Jato d\'Água', cost: 2, damage: 30 },
    ],
  },
  {
    id: 'croconaw', displayName: 'Croconaw', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage1', hp: 80, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    evolvesFrom: 'Totodile',
    tcgId: 'neo1-20', imageUrl: img('neo1-20'),
    attacks: [
      { name: 'Hidrojato', cost: 2, damage: 40 },
      { name: 'Rasgadura', cost: 3, damage: 70 },
    ],
  },
  {
    id: 'feraligatr', displayName: 'Feraligatr', type: 'pokemon',
    pokemonType: 'Water', stage: 'Stage2', hp: 170, retreatCost: 3, pointValue: 3,
    weakness: 'Electric',
    evolvesFrom: 'Croconaw',
    tcgId: 'neo1-4', imageUrl: img('neo1-4'),
    attacks: [
      { name: 'Aqua Jato', cost: 3, damage: 90 },
      { name: 'Frenesi Aquático', cost: 5, damage: 180, effect: 'Descarte 2 energias deste Pokémon.' },
    ],
  },
  {
    id: 'lugia', displayName: 'Lugia', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 130, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    tcgId: 'neo2-9', imageUrl: img('neo2-9'),
    attacks: [
      { name: 'Aeroblast', cost: 3, damage: 80 },
      { name: 'Temporal de Prata', cost: 5, damage: 150 },
    ],
  },
  {
    id: 'suicune', displayName: 'Suicune', type: 'pokemon',
    pokemonType: 'Water', stage: 'Basic', hp: 120, retreatCost: 2, pointValue: 2,
    weakness: 'Electric',
    tcgId: 'ex10-16', imageUrl: img('ex10-16'),
    attacks: [
      { name: 'Aurora Polar', cost: 2, damage: 50 },
      { name: 'Ventania Gelada', cost: 4, damage: 100 },
    ],
  },
];

export const POKEMON_CARDS: PokemonCardDef[] = [
  ...BASE_POKEMON_CARDS,
  ...DARK_CARDS,
  ...DRAGON_CARDS,
  ...METAL_CARDS,
  ...FAIRY_CARDS,
  ...GRASS_EXTRA,
  ...FIRE_EXTRA,
  ...WATER_EXTRA,
];

// ─── Trainers ──────────────────────────────────────────────────────────────────

export const TRAINER_CARDS: TrainerCardDef[] = [
  {
    id: 'ultra-ball', displayName: 'Ultra Ball', type: 'item', cost: 1,
    effect: 'Descarte 2 cartas da mão. Procure qualquer Pokémon no deck e adicione à mão.',
    tcgId: 'sv1-196', imageUrl: img('sv1-196'),
  },
  {
    id: 'nest-ball', displayName: 'Nest Ball', type: 'item', cost: 1,
    effect: 'Procure um Pokémon Básico no deck e coloque-o em jogo vulnerável.',
    tcgId: 'sv1-181', imageUrl: img('sv1-181'),
  },
  {
    id: 'great-ball', displayName: 'Great Ball', type: 'item', cost: 1,
    effect: 'Veja as 7 cartas do topo do deck. Pegue 1 Pokémon e embaralhe o resto.',
    tcgId: 'sv1-175', imageUrl: img('sv1-175'),
  },
  {
    id: 'level-ball', displayName: 'Level Ball', type: 'item', cost: 1,
    effect: 'Procure um Pokémon com 90 HP ou menos no deck e adicione à mão.',
    tcgId: 'swsh5-129', imageUrl: img('swsh5-129'),
  },
  {
    id: 'rare-candy', displayName: 'Rare Candy', type: 'item', cost: 1,
    effect: 'Evolua um Pokémon Básico em jogo diretamente para Stage 2, ignorando Stage 1 e timing.',
    tcgId: 'sv1-191', imageUrl: img('sv1-191'),
  },
  {
    id: 'potion', displayName: 'Potion', type: 'item', cost: 1,
    effect: 'Cure 30 de dano de 1 Pokémon seu em jogo.',
    tcgId: 'sv1-188', imageUrl: img('sv1-188'),
  },
  {
    id: 'super-potion', displayName: 'Super Potion', type: 'item', cost: 1,
    effect: 'Cure 80 de dano de 1 Pokémon seu em jogo. Descarte 1 energia do Energy Pool.',
    tcgId: 'xy1-128', imageUrl: img('xy1-128'),
  },
  {
    id: 'ordinary-rod', displayName: 'Ordinary Rod', type: 'item', cost: 1,
    effect: 'Embaralhe até 2 Pokémon e/ou até 2 cartas de energia de volta do seu descarte para o deck.',
    tcgId: 'swsh9-171', imageUrl: img('swsh9-171'),
  },
  {
    id: 'super-rod', displayName: 'Super Rod', type: 'item', cost: 1,
    effect: 'Embaralhe até 3 Pokémon e/ou cartas do seu descarte de volta para o deck.',
    tcgId: 'sv2-188', imageUrl: img('sv2-188'),
  },
  {
    id: 'switch', displayName: 'Switch', type: 'item', cost: 1,
    effect: 'Devolva 1 Pokémon seu (e suas evoluções) à mão. Em seguida, coloque 1 Pokémon da sua mão em jogo sem custo.',
    tcgId: 'swsh1-183', imageUrl: img('swsh1-183'),
  },
  {
    id: 'professors-research', displayName: 'Pesquisa do Professor', type: 'supporter', cost: 3,
    effect: 'Descarte sua mão. Compre 7 cartas.',
    tcgId: 'sv1-190', imageUrl: img('sv1-190'),
  },
  {
    id: 'iono', displayName: 'Iono', type: 'supporter', cost: 3,
    effect: 'Cada jogador embaralha sua mão no deck e compra 1 carta por ponto marcado (mínimo 1).',
    tcgId: 'sv2-185', imageUrl: img('sv2-185'),
  },
  {
    id: 'cynthia', displayName: 'Cynthia', type: 'supporter', cost: 3,
    effect: 'Embaralhe sua mão no deck e compre 6 cartas.',
    tcgId: 'sm5-119', imageUrl: img('sm5-119'),
  },
  {
    id: 'hop', displayName: 'Hop', type: 'supporter', cost: 3,
    effect: 'Compre 3 cartas.',
    tcgId: 'swsh1-165', imageUrl: img('swsh1-165'),
  },
  {
    id: 'bosss-orders', displayName: 'Ordens do Chefe', type: 'supporter', cost: 3,
    effect: 'Escolha 1 Pokémon PRONTO do oponente. Ele se torna VULNERÁVEL imediatamente.',
    tcgId: 'sv2-172', imageUrl: img('sv2-172'),
  },
];

export const ALL_CARDS: (PokemonCardDef | TrainerCardDef)[] =
  [...POKEMON_CARDS, ...TRAINER_CARDS];

export function getCardById(id: string): PokemonCardDef | TrainerCardDef | undefined {
  return ALL_CARDS.find(c => c.id === id);
}
