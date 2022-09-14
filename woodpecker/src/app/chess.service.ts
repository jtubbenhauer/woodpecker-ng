import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess, SQUARES } from 'chess.js';
import { HttpClient } from '@angular/common/http';
import { puzzles } from 'prismaclient';
import { Observable } from 'rxjs';
import { Api } from 'chessground/api';
import { Color, Key } from 'chessground/types';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  puzzle!: puzzles;
  cg!: Api;
  chess!: Chess;
  moves!: Key[];
  lastMove = 0;

  constructor(private http: HttpClient) {}

  getRandomPuzzle(): Observable<puzzles> {
    return this.http.get<puzzles>('http://localhost:3000/puzzle/random');
  }

  initChessground(el: HTMLElement): any {
    this.getRandomPuzzle().subscribe({
      next: (puzzle) => {
        this.puzzle = puzzle;
        this.chess = new Chess(puzzle.fen);
        this.cg = Chessground(el, {
          fen: this.chess.fen(),
          movable: {
            free: false,
            color: this.toColour(this.chess),
            showDests: false,
            events: { after: (orig, dest) => this.handleMove(orig, dest) },
            dests: this.getLegalMoves(),
          },
          turnColor: this.toColour(this.chess),
          orientation: this.getOrientation(this.chess),
        });
        this.makeFirstMove(this.movesToArr(this.puzzle.moves));
      },
    });
  }

  toColour(chess: Chess): Color {
    return chess.turn() == 'w' ? 'white' : 'black';
  }

  getOrientation(chess: Chess): Color {
    return chess.turn() == 'w' ? 'black' : 'white';
  }

  makeFirstMove(moves: Key[]) {
    let move = this.convertSingleMove(moves[0]);
    this.cg.move(move.from as Key, move.to as Key);
  }

  convertSingleMove(move: Key) {
    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
    };
  }

  movesToArr(moves: string) {
    let arr: Key[] = [];
    this.puzzle.moves.split(' ').map((move) => {
      arr.push(move as Key);
    });
    return arr;
  }

  handleMove(orig: Key, dest: Key) {
    console.log('move');
  }

  getLegalMoves(): Map<Key, Key[]> {
    const legalMoves = new Map();
    SQUARES.forEach((square) => {
      const moves = this.chess.moves({ square: square, verbose: true });
      if (moves.length) {
        legalMoves.set(
          square,
          moves.map((move) => typeof move !== 'string' && move.to)
        );
      }
    });
    return legalMoves;
  }
}
