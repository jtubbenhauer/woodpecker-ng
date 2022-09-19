export interface Puzzle {
  puzzleId: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingDeviation: number;
  themes: string[];
}
