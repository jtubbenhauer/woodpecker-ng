export interface Puzzle {
  puzzleid: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingdeviation: number;
  themes: string[];
  completed: boolean;
}
