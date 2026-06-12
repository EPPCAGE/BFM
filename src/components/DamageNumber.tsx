import { motion, AnimatePresence } from 'framer-motion';

export interface DamageEvent {
  id: string;
  delta: number; // negative = damage, positive = heal
}

interface Props {
  events: DamageEvent[];
  onDone: (id: string) => void;
}

export function DamageNumber({ events, onDone }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {events.map(ev => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 1, y: 0, scale: 1.5, x: (Math.random() - 0.5) * 20 }}
            animate={{ opacity: 0, y: -65, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            onAnimationComplete={() => onDone(ev.id)}
            className={`absolute font-black select-none ${
              ev.delta < 0 ? 'text-red-400 text-3xl' : 'text-green-400 text-2xl'
            }`}
            style={{ textShadow: ev.delta < 0 ? '0 0 10px rgba(239,68,68,0.8), 0 2px 4px rgba(0,0,0,0.9)' : '0 0 10px rgba(34,197,94,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}
          >
            {ev.delta < 0 ? ev.delta : `+${ev.delta}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
