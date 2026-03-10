import { GameContext } from '../GameEngine';

export interface GameState {
  readonly name: string;
  enter(context: GameContext): void;
  exit(context: GameContext): void;
}
