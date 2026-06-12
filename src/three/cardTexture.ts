import * as THREE from 'three';
import type { CardDef, PokemonType } from '../game/types';

/**
 * WebGL textures require CORS. images.pokemontcg.io does NOT send CORS headers,
 * so we route through the weserv image proxy which adds `Access-Control-Allow-Origin: *`.
 * If anything fails, we generate a styled fallback canvas so cards are never blank.
 */

const TYPE_GRADIENT: Record<PokemonType, [string, string]> = {
  Fire:     ['#7c2d12', '#f97316'],
  Water:    ['#1e3a8a', '#3b82f6'],
  Grass:    ['#14532d', '#22c55e'],
  Electric: ['#854d0e', '#eab308'],
  Psychic:  ['#581c87', '#a855f7'],
  Fighting: ['#7c2d12', '#b45309'],
  Normal:   ['#334155', '#94a3b8'],
  Dragon:   ['#312e81', '#6366f1'],
  Dark:     ['#111827', '#374151'],
  Metal:    ['#374151', '#9ca3af'],
  Fairy:    ['#831843', '#ec4899'],
};

function proxied(url: string): string {
  // strip protocol for weserv, keep https output, fit to card size
  const bare = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(bare)}&w=512&output=jpg&q=85`;
}

function makeFallbackTexture(card: CardDef): THREE.Texture {
  const W = 512, H = 716;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  const [c1, c2] = card.type === 'pokemon'
    ? TYPE_GRADIENT[card.pokemonType]
    : card.type === 'item' ? ['#78350f', '#d97706'] : ['#581c87', '#9333ea'];

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // inner frame
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 44px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.displayName, W / 2, 100);

  if (card.type === 'pokemon') {
    ctx.font = 'bold 120px Segoe UI, sans-serif';
    ctx.fillText('★', W / 2, H / 2 + 40);
    ctx.font = 'bold 40px Segoe UI, sans-serif';
    ctx.fillText(`${card.hp} HP`, W / 2, H - 80);
  } else {
    ctx.font = 'bold 36px Segoe UI, sans-serif';
    ctx.fillText(card.type === 'item' ? 'ITEM' : 'APOIADOR', W / 2, H - 80);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const cache = new Map<string, THREE.Texture>();

export function loadCardTexture(card: CardDef): THREE.Texture {
  if (cache.has(card.id)) return cache.get(card.id)!;

  // start with fallback so the card shows instantly, then swap when the real art arrives
  const fallback = makeFallbackTexture(card);
  cache.set(card.id, fallback);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(
    proxied(card.imageUrl),
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      // copy onto the same texture object reference users hold? Instead, replace cache + dispatch
      cache.set(card.id, tex);
      // notify listeners that a better texture is ready
      listeners.get(card.id)?.forEach((cb) => cb(tex));
    },
    undefined,
    () => {
      // keep fallback on error
    },
  );

  return fallback;
}

// Allow components to subscribe to the upgraded (real-art) texture
const listeners = new Map<string, Set<(t: THREE.Texture) => void>>();
export function onCardTexture(cardId: string, cb: (t: THREE.Texture) => void): () => void {
  if (!listeners.has(cardId)) listeners.set(cardId, new Set());
  listeners.get(cardId)!.add(cb);
  return () => listeners.get(cardId)?.delete(cb);
}

// Shared card-back texture
let backTex: THREE.Texture | null = null;
export function loadBackTexture(): THREE.Texture {
  if (backTex) return backTex;
  const W = 512, H = 716;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1e1b4b');
  g.addColorStop(0.5, '#312e81');
  g.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(129,140,248,0.6)';
  ctx.lineWidth = 14;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.fillStyle = 'rgba(129,140,248,0.25)';
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 80px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', W / 2, H / 2);
  backTex = new THREE.CanvasTexture(cv);
  backTex.colorSpace = THREE.SRGBColorSpace;
  return backTex;
}
