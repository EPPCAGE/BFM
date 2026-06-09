import type { EnergyCard } from '../game/types';
import { CardImage } from './CardImage';

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
        {label} — Energy Pool: {energyPool.length} | Disponível: <span className="text-yellow-300">{available}</span> | Usada: <span className="text-slate-400">{used}</span>
      </div>
      <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide" style={{ maxHeight: 70 }}>
        {energyPool.map((e) => (
          <div
            key={e.instanceId}
            className={`relative rounded transition-all duration-200 ${e.used ? 'card-energy-used' : 'card-energy-available'}`}
            style={{ width: 36, height: 50 }}
            title={`${e.def.displayName} — ${e.used ? 'usada' : 'disponível'}`}
          >
            <CardImage card={e.def} className="w-full h-full" />
          </div>
        ))}
        {energyPool.length === 0 && (
          <span className="text-slate-500 text-xs italic">Vazio</span>
        )}
      </div>
    </div>
  );
}
