import type { EnergyCard } from '../game/types';

function CardBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 63 88" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="63" height="88" rx="4" fill="#1a56a0" />
      <rect x="3" y="3" width="57" height="82" rx="3" fill="#1e63bc" />
      <rect x="5" y="5" width="53" height="78" rx="2" fill="#1a56a0" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="31.5" cy="44" r="18" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="31.5" cy="44" r="10" fill="#fbbf24" />
      <circle cx="31.5" cy="44" r="5" fill="#1a56a0" />
      <line x1="13.5" y1="44" x2="49.5" y2="44" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="31.5" y="18" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="bold" fontFamily="sans-serif">POKÉMON</text>
    </svg>
  );
}

interface Props {
  energyPool: EnergyCard[];
  label: string;
}

export function EnergyPool({ energyPool, label }: Props) {
  const available = energyPool.filter(e => !e.used).length;
  const used = energyPool.filter(e => e.used).length;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-bold text-slate-300">
        {label} — Energia: {energyPool.length} | Disponível: <span className="text-yellow-300">{available}</span> | Usada: <span className="text-slate-400">{used}</span>
      </div>
      <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide" style={{ maxHeight: 70 }}>
        {energyPool.map((e) => (
          <div
            key={e.instanceId}
            className={`relative rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
            style={{ width: 36, height: 50 }}
            title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
          >
            <CardBack className="w-full h-full" />
          </div>
        ))}
        {energyPool.length === 0 && (
          <span className="text-slate-500 text-xs italic">Vazio</span>
        )}
      </div>
    </div>
  );
}
