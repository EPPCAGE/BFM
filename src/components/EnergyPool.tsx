import type { EnergyCard } from '../game/types';

function EnergyCardFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 63 88" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Card base */}
      <rect width="63" height="88" rx="4" fill="#1c1a08" />
      <rect x="2" y="2" width="59" height="84" rx="3" fill="#2a2510" stroke="#fbbf24" strokeWidth="1.2" />
      {/* Glow background */}
      <ellipse cx="31.5" cy="44" rx="22" ry="28" fill="#78350f" opacity="0.6" />
      {/* Lightning bolt */}
      <polygon
        points="38,10 24,42 33,42 25,78 44,38 34,38"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeLinejoin="round"
      />
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
            <EnergyCardFace className="w-full h-full" />
          </div>
        ))}
        {energyPool.length === 0 && (
          <span className="text-slate-500 text-xs italic">Vazio</span>
        )}
      </div>
    </div>
  );
}
