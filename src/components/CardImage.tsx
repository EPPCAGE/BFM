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

  // Use background-image so browser EXIF auto-rotation is ignored
  return (
    <div
      className={`rounded-lg bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${JSON.stringify(card.imageUrl)})`,
        ...style,
      }}
      role="img"
      aria-label={card.displayName}
      onError={undefined}
    >
      {/* Hidden img to detect load errors */}
      <img
        src={card.imageUrl}
        alt=""
        className="hidden"
        onError={() => setErrored(true)}
        loading="lazy"
      />
    </div>
  );
}
