import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess, Square, SQUARES } from 'chess.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Puzzle } from '../models/puzzle';
import { BehaviorSubject, Subject } from 'rxjs';
import { Api } from 'chessground/api';
import { Color, Key } from 'chessground/types';
import { envPrivate as env } from '../../environments/env-private';
import boardSvgs from '../utils/svg';
import { moveSound, checkSound, captureSound } from '../utils/sounds';

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
  audio = new Audio();
  apiHeaders = new HttpHeaders({
    'X-RapidAPI-Key': env.chessApiKey,
    'X-RapidAPI-Host': env.chessApiHost,
  });

  constructor(private http: HttpClient) {}

  public resetPuzzle() {
    this.puzzleComplete$.next(false);
    this.cg.setAutoShapes([]);
    this.currentMove = 0;
    this.chess = new Chess(this.puzzle.fen);
    this.cg.set({
      fen: this.chess.fen(),
      check: this.chess.isCheck(),
    });
    this.moves = this.puzzle.moves as Key[];
    this.makeFirstMove();
  }

  public backOne() {
    this.chess.undo();
    this.cg.set({
      movable: { dests: this.getLegalMoves(), color: this.toColour() },
      turnColor: this.toColour(),
      fen: this.chess.fen(),
      check: this.chess.isCheck(),
    });
    this.cg.setAutoShapes([]);
    this.lastMoveCorrect$.next(true);
  }

  public getHint() {
    let move = this.convertSingleMove(this.moves[this.currentMove]);
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
        color: this.toColour(),
        showDests: false,
        events: {
          after: (orig, dest) => {
            this.onMove(orig, dest);
          },
        },
        dests: this.getLegalMoves(),
      },
      draggable: { showGhost: false },
      events: {
        move: (orig, dest, capturedPiece) => {
          if (this.chess.inCheck()) {
            checkSound.play();
          } else if (capturedPiece) {
            captureSound.play();
          } else {
            moveSound.play();
          }
        },
      },
      turnColor: this.toColour(),
      orientation: this.getOrientation(),
      check: this.chess.isCheck(),
    });
    // this.moves = this.movesToArr();
    this.moves = this.puzzle.moves as Key[];
    this.makeFirstMove();
    this.currentColour$.next(this.toColour());
  }

  private getPieceTypeAtOrig(orig: Key) {
    return this.chess.get(orig as Square);
  }

  private isPromotion(orig: Key) {
    let pieceData = this.getPieceTypeAtOrig(orig);
    if (pieceData.type == 'p') {
      if (pieceData.color == 'b' && orig.substring(1, 2) == '2') {
        return true;
      } else return pieceData.color == 'w' && orig.substring(1, 2) == '7';
    } else {
      return false;
    }
  }

  private makeMove(from: Key, to: Key) {
    this.chess.move({ from: from, to: to });
    // console.log(this.chess.move({ from: from, to: to }.flag));
    this.cg.set({
      turnColor: this.toColour(),
      movable: {
        color: this.toColour(),
        dests: this.getLegalMoves(),
      },
      check: this.chess.isCheck(),
    });
    this.cg.move(from, to);
  }

  private onMove(orig: Key, dest: Key) {
    console.log(this.getPieceTypeAtOrig(orig));

    this.cg.setAutoShapes([]);
    // If there's moves remaining in the set
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
    let { from, to } = this.convertSingleMove(this.moves[this.currentMove]);
    this.makeMove(from as Key, to as Key);
    this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.right }]);
    this.currentMove++;
  }

  private onWrongMove(orig: Key, dest: Key) {
    this.puzzleFailed$.next(true);
    this.lastMoveCorrect$.next(false);
    this.chess.move({ from: orig, to: dest });
    this.cg.set({ check: this.chess.isCheck() });
    this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.wrong }]);
    this.cg.stop();
  }

  private isCorrect(orig: Key, dest: Key) {
    let move = '';
    move = move.concat(orig, dest);
    return move === this.moves[this.currentMove];
  }

  private toColour(): Color {
    return this.chess.turn() == 'w' ? 'white' : 'black';
  }

  private getOrientation(): Color {
    return this.chess.turn() == 'w' ? 'black' : 'white';
  }

  private makeFirstMove() {
    let move = this.convertSingleMove(this.moves[0]);
    this.makeMove(move.from as Key, move.to as Key);
    this.currentMove = 1;
  }

  // Convert move to object
  private convertSingleMove(move: string) {
    console.log(move);
    if (move.length == 4) {
      return {
        from: move.substring(0, 2),
        to: move.substring(2, 4),
      };
    } else {
      return {
        from: move.substring(0, 2),
        to: move.substring(2, 4),
        promotion: move.substring(4, 5),
      };
    }
  }

  private getLegalMoves(): Map<Key, Key[]> {
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

  private playAudio(type: 'capture' | 'move' | 'check') {
    this.audio.src = `../assets/${type}.mp3`;
    this.audio.load();
    this.audio.play();
  }
}
