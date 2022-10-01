import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;
import { Puzzle } from './puzzle';
import Theme from './theme';

export interface Set {
  createdAt: Timestamp;
  rating: string;
  puzzleCount: number;
  currentTime: number;
  bestTime: number;
  timesCompleted: number;
  currentPuzzleId: string;
  completed: number;
  best?: number;
  failed: number;
  themes: Array<Theme>;
  puzzles: Puzzle[];
}
