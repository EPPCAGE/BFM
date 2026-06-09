import { useEffect, useRef } from 'react';
import type { LogEntry } from '../game/types';

interface Props {
  entries: LogEntry[];
}

export function GameLog({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col h-full overflow-y-auto scrollbar-hide">
      <h3 className="text-xs font-bold text-slate-400 mb-1 sticky top-0 bg-slate-900">LOG DO JOGO</h3>
      <div className="flex flex-col gap-0.5 text-xs">
        {entries.map((e) => (
          <div
            key={e.id}
            className={`rounded px-1.5 py-0.5 ${
              e.player === 'player'
                ? 'bg-blue-900/40 text-blue-200'
                : 'bg-red-900/40 text-red-200'
            }`}
          >
            <span className="text-slate-500 text-[10px] mr-1">T{e.turn}</span>
            {e.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
