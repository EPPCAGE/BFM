import { useState, useCallback, useEffect } from 'react';
import type { CardDef } from '../game/types';

export function useTooltip() {
  const [tooltip, setTooltip] = useState<{ card: CardDef; x: number; y: number } | null>(null);

  // Safety net: hide tooltip if pointer leaves a [data-card-hover] element or exits the window
  useEffect(() => {
    if (!tooltip) return;
    function onMove(e: PointerEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el?.closest('[data-card-hover]')) setTooltip(null);
    }
    function onLeave() { setTooltip(null); }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [tooltip]);

  const showTooltip = useCallback((card: CardDef, e: React.MouseEvent) => {
    setTooltip({ card, x: e.clientX, y: e.clientY });
  }, []);

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return { tooltip, showTooltip, moveTooltip, hideTooltip };
}
