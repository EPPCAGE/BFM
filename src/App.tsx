import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import './index.css';

export default function App() {
  const { gameState } = useGameStore();
  return gameState ? <GameBoard /> : <MainMenu />;
}
