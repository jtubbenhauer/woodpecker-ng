import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Puzzle } from '../models/puzzle';
import { BehaviorSubject, Subject } from 'rxjs';
import { Api } from 'chessground/api';
import { Key } from 'chessground/types';
import { envPrivate as env } from '../../environments/env-private';
import boardSvgs from '../utils/svg';
import { moveSound, checkSound, captureSound } from '../utils/sounds';
import {
  convertSingleMove,
  getLastMove,
  getLegalMoves,
  getOrientation,
  toColour,
} from '../utils/chess';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  puzzle!: Puzzle;
  cg!: Api;
  chess!: Chess;
  moves!: Key[];
  currentMove!: number;
  currentColour$ = new BehaviorSubject('');
  lastMoveCorrect$ = new BehaviorSubject(true);
  puzzleComplete$ = new Subject<boolean>();
  puzzleFailed$ = new Subject<boolean>();
  apiHeaders = new HttpHeaders({
    'X-RapidAPI-Key': env.chessApiKey,
    'X-RapidAPI-Host': env.chessApiHost,
  });

  constructor(private http: HttpClient) {}

  public initChessground(puzzle: any, el: HTMLElement): any {
    this.puzzleFailed$.next(false);
    this.puzzleComplete$.next(false);
    this.currentMove = 0;
    this.puzzle = puzzle;
    this.chess = new Chess(puzzle.fen);
    this.cg = Chessground(el, {
      fen: this.chess.fen(),
      selectable: {
        enabled: false,
      },
      movable: {
        free: false,
        color: toColour(this.chess),
        showDests: false,
        events: {
          after: (orig, dest) => {
            this.onMove(orig, dest);
          },
        },
        dests: getLegalMoves(this.chess),
      },
      draggable: { showGhost: false },
      turnColor: toColour(this.chess),
      orientation: getOrientation(this.chess),
      check: this.chess.inCheck(),
    });
    this.moves = this.puzzle.moves as Key[];
    this.makeFirstMove();
    this.currentColour$.next(toColour(this.chess));
  }

  public resetPuzzle() {
    this.puzzleComplete$.next(false);
    this.cg.setAutoShapes([]);
    this.currentMove = 0;
    this.chess = new Chess(this.puzzle.fen);
    this.cg.set({
      fen: this.chess.fen(),
      check: this.chess.inCheck(),
    });
    this.moves = this.puzzle.moves as Key[];
    this.makeFirstMove();
  }

  public backOne() {
    this.chess.undo();
    this.cg.set({
      movable: {
        dests: getLegalMoves(this.chess),
        color: toColour(this.chess),
      },
      turnColor: toColour(this.chess),
      fen: this.chess.fen(),
      check: this.chess.inCheck(),
    });
    this.cg.setAutoShapes([]);
    this.lastMoveCorrect$.next(true);
  }

  public getHint() {
    let move = convertSingleMove(this.moves[this.currentMove]);
    this.cg.selectSquare(move.from as Key);
  }

  public getPromPuzzle(el: HTMLElement) {
    this.http
      .get<any>(env.chessApiUrl, {
        headers: this.apiHeaders,
        params: { themes: '["promotion"]', count: '1' },
      })
      .subscribe((next) => {
        this.initChessground(next.puzzles[0], el);
      });
  }

  private makeMove(from: Key, to: Key) {
    this.chess.move({ from: from, to: to });
    // Refactor this and find strange flag cases
    const lastMove = getLastMove(this.chess);
    console.log(lastMove);
    if (this.chess.inCheck()) {
      checkSound.play();
    } else if (lastMove.captured) {
      captureSound.play();
    } else {
      moveSound.play();
    }
    this.cg.set({
      turnColor: toColour(this.chess),
      movable: {
        color: toColour(this.chess),
        dests: getLegalMoves(this.chess),
      },
      check: this.chess.inCheck(),
    });
    this.cg.move(from, to);
  }

  private onMove(orig: Key, dest: Key) {
    this.cg.setAutoShapes([]);
    // If there's moves remaining in the set
    if (this.currentMove < this.moves.length - 1) {
      if (this.isCorrect(orig, dest)) {
        this.onRightMove(orig, dest);
      } else {
        this.onWrongMove(orig, dest);
      }
    } else {
      // If final move
      if (this.isCorrect(orig, dest)) {
        this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.right }]);
        this.makeMove(orig, dest);
        this.cg.stop();
        this.puzzleComplete$.next(true);
      } else {
        this.onWrongMove(orig, dest);
      }
    }
  }

  private onRightMove(orig: Key, dest: Key) {
    this.lastMoveCorrect$.next(true);
    this.currentMove++;
    this.makeMove(orig, dest);
    // Make computers next move after delay
    setTimeout(() => {
      let { from, to } = convertSingleMove(this.moves[this.currentMove]);
      this.makeMove(from as Key, to as Key);
      this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.right }]);
      this.currentMove++;
    }, 300);
  }

  private onWrongMove(orig: Key, dest: Key) {
    this.puzzleFailed$.next(true);
    this.lastMoveCorrect$.next(false);
    this.chess.move({ from: orig, to: dest });
    this.cg.set({ check: this.chess.inCheck() });
    this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.wrong }]);
    this.cg.stop();
  }

  private isCorrect(orig: Key, dest: Key) {
    let move = '';
    move = move.concat(orig, dest);
    return move === this.moves[this.currentMove];
  }

  private makeFirstMove() {
    let move = convertSingleMove(this.moves[0]);
    this.makeMove(move.from as Key, move.to as Key);
    this.currentMove = 1;
  }
}
