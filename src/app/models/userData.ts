import { Puzzle } from './puzzle';

export interface UserDoc {
  email: string;
  sets?: SetDoc[];
}

export interface SetDoc {
  puzzles: Puzzle[];
}
