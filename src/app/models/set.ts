import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;

export interface Set {
  createdAt: Timestamp;
  rating: string;
  puzzleCount: number;
  timesCompleted: number;
  currentPuzzleId: string;
  completed: number;
  best?: number;
}
