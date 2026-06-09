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

export function EnergyPool({ energyPool }: Props) {
  const available = energyPool.filter(e => !e.used).length;
  const used = energyPool.filter(e => e.used).length;

  return (
    <div className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-1.5 border border-white/5">
      {/* Summary badge */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-0.5">Energia</div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full px-2 py-px font-extrabold text-[11px]">
            ⚡{available}
          </span>
          {used > 0 && (
            <span className="bg-slate-700/50 text-slate-500 border border-slate-600/30 rounded-full px-2 py-px font-bold text-[10px]">
              ✗{used}
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide" style={{ maxHeight: 62 }}>
        {energyPool.map((e) => (
          <div
            key={e.instanceId}
            className={`relative rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
            style={{ width: 32, height: 44 }}
            title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
          >
            <EnergyCardFace className="w-full h-full" />
          </div>
        ))}
        {energyPool.length === 0 && (
          <span className="text-slate-600 text-xs italic">vazio</span>
        )}
      </div>
    </div>
  );
}
