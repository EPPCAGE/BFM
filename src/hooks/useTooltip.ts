import { useState, useCallback } from 'react';
import type { CardDef } from '../game/types';

export function useTooltip() {
  const [tooltip, setTooltip] = useState<{ card: CardDef; x: number; y: number } | null>(null);

  const showTooltip = useCallback((card: CardDef, e: React.MouseEvent) => {
    setTooltip({ card, x: e.clientX, y: e.clientY });
  }, []);

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return { tooltip, showTooltip, moveTooltip, hideTooltip };
}
