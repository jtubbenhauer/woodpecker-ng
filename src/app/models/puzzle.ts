export interface Puzzle {
  puzzleId: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingdeviation: number;
  themes: string[];
}
