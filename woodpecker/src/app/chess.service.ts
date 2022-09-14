import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess, SQUARES } from 'chess.js';
import { HttpClient } from '@angular/common/http';
import { Puzzle } from 'prismaclient';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Api } from 'chessground/api';
import { Color, Key } from 'chessground/types';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  puzzle!: Puzzle;
  cg!: Api;
  chess!: Chess;
  moves!: Key[];
  currentMove!: number;
  feedbackMessage = new BehaviorSubject<string>('Make a move');

  constructor(private http: HttpClient) {}

  getRandomPuzzle(): Observable<Puzzle> {
    return this.http.get<Puzzle>('http://localhost:3000/puzzle/random');
  }

  initChessground(el: HTMLElement): any {
    this.currentMove = 0;
    this.getRandomPuzzle().subscribe({
      next: (puzzle) => {
        this.puzzle = puzzle;
        this.chess = new Chess(puzzle.fen);
        this.cg = Chessground(el, {
          fen: this.chess.fen(),
          movable: {
            free: false,
            color: this.toColour(),
            showDests: false,
            events: { after: (orig, dest) => this.onMove(orig, dest) },
            dests: this.getLegalMoves(),
          },
          turnColor: this.toColour(),
          orientation: this.getOrientation(),
        });
        this.moves = this.movesToArr();
        this.makeFirstMove();
      },
    });
  }

  resetPuzzle() {
    this.currentMove = 0;
    this.chess = new Chess(this.puzzle.fen);
    this.cg.set({
      fen: this.chess.fen(),
      movable: {
        free: false,
        color: this.toColour(),
        showDests: false,
        events: { after: (orig, dest) => this.onMove(orig, dest) },
        dests: this.getLegalMoves(),
      },
      turnColor: this.toColour(),
      orientation: this.getOrientation(),
    });
    this.moves = this.movesToArr();
    this.makeFirstMove();
  }

  makeMove(from: Key, to: Key) {
    this.chess.move({ from: from, to: to });
    this.cg.set({
      turnColor: this.toColour(),
      movable: {
        color: this.toColour(),
        dests: this.getLegalMoves(),
      },
    });
    this.cg.move(from, to);
  }

  onMove(orig: Key, dest: Key) {
    // If there's moves remaining in the puzzle
    if (this.currentMove < this.moves.length - 1) {
      // If player's move is correct
      if (this.isCorrect(orig, dest)) {
        this.onRightMove(orig, dest);
      } else {
        this.onWrongMove(orig, dest);
      }
    } else {
      // If final move
      if (this.isCorrect(orig, dest)) {
        this.feedbackMessage.next('Puzzle complete');
        this.makeMove(orig, dest);
        this.cg.stop();
      } else {
        this.onWrongMove(orig, dest);
      }
    }
  }

  onRightMove(orig: Key, dest: Key) {
    this.feedbackMessage.next('Correct! Keep going');
    this.currentMove++;
    this.makeMove(orig, dest);
    // Make computers next move after delay
    setTimeout(() => {
      let { from, to } = this.convertSingleMove(this.moves[this.currentMove]);
      this.makeMove(from as Key, to as Key);
      this.currentMove++;
    }, 300);
  }

  onWrongMove(orig: Key, dest: Key) {
    this.feedbackMessage.next('Wrong move! Try again');
    this.cg.move(dest, orig);
    this.cg.set({
      fen: this.chess.fen(),
      turnColor: this.toColour(),
      movable: { color: this.toColour(), dests: this.getLegalMoves() },
    });
  }

  getFeedbackMessage() {
    return this.feedbackMessage;
  }

  getHint() {
    let move = this.convertSingleMove(this.moves[this.currentMove]);
    this.cg.selectSquare(move.from as Key);
  }

  isCorrect(orig: Key, dest: Key) {
    let move = '';
    move = move.concat(orig, dest);
    return move === this.moves[this.currentMove];
  }

  toColour(): Color {
    return this.chess.turn() == 'w' ? 'white' : 'black';
  }

  getOrientation(): Color {
    return this.chess.turn() == 'w' ? 'black' : 'white';
  }

  makeFirstMove() {
    let move = this.convertSingleMove(this.moves[0]);
    this.makeMove(move.from as Key, move.to as Key);
    this.currentMove = 1;
  }

  // Convert move to object
  convertSingleMove(move: Key) {
    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
    };
  }

  movesToArr() {
    let arr: Key[] = [];
    this.puzzle.moves.split(' ').map((move) => {
      arr.push(move as Key);
    });
    return arr;
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
