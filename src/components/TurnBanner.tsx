import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Props {
  currentPlayer: 'player' | 'ai';
  turn: number;
}

export function TurnBanner({ currentPlayer, turn }: Props) {
  const [visible, setVisible] = useState(false);
  const prevRef = useRef<{ player: string; turn: number } | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev && (prev.player !== currentPlayer || prev.turn !== turn)) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1700);
      prevRef.current = { player: currentPlayer, turn };
      return () => clearTimeout(t);
    }
    if (!prev) {
      prevRef.current = { player: currentPlayer, turn };
    }
  }, [currentPlayer, turn]);

  const isPlayer = currentPlayer === 'player';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-8 py-2.5 rounded-2xl font-black text-lg tracking-widest shadow-2xl pointer-events-none"
          style={{
            background: isPlayer
              ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)'
              : 'linear-gradient(135deg,#b91c1c,#ef4444)',
            boxShadow: isPlayer
              ? '0 0 40px rgba(59,130,246,0.7), 0 4px 20px rgba(0,0,0,0.6)'
              : '0 0 40px rgba(220,38,38,0.7), 0 4px 20px rgba(0,0,0,0.6)',
            border: isPlayer ? '1px solid rgba(147,197,253,0.4)' : '1px solid rgba(252,165,165,0.4)',
          }}
        >
          {isPlayer ? '⚔️ SUA VEZ' : '🤖 VEZ DA IA'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
