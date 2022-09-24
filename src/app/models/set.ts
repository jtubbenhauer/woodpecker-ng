import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;
import { Puzzle } from './puzzle';

export interface Set {
  createdAt: Timestamp;
  rating: string;
  puzzleCount: number;
  timesCompleted: number;
  currentPuzzleId: string;
  completed: number;
  best?: number;
  attempts: number;
  puzzles: Puzzle[];
}
