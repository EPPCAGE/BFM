import { useState } from 'react';
import type { CardDef } from '../game/types';

interface Props {
  card: CardDef;
  className?: string;
  style?: React.CSSProperties;
}

export function CardImage({ card, className = '', style }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-700 rounded-lg text-xs text-center p-1 ${className}`}
        style={style}
      >
        <span className="font-bold text-white text-[10px] leading-tight">{card.displayName}</span>
        {card.type === 'pokemon' && (
          <span className="text-slate-300 text-[9px]">{card.hp} HP</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={card.imageUrl}
      alt={card.displayName}
      className={`rounded-lg object-cover ${className}`}
      style={{ imageOrientation: 'none', ...style }}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}
