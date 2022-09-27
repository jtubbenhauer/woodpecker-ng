import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Puzzle } from '../models/puzzle';
import { BehaviorSubject, Subject } from 'rxjs';
import { Api } from 'chessground/api';
import { Key, Piece } from 'chessground/types';
import { envPrivate as env } from '../../environments/env-private';
import boardSvgs from '../utils/svg';
import {
  convertPromotionPiece,
  convertSingleMove,
  getLastMove,
  getLegalMoves,
  getOrientation,
  getPromotionDisplaySquares,
  getWrongPromotionSquares,
  isPromotion,
  toColour,
} from '../utils/chess';
import { Howl } from 'howler';

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
  moveSound = new Howl({
    src: ['../assets/move.mp3'],
  });
  checkSound = new Howl({
    src: ['../assets/check.mp3'],
  });
  captureSound = new Howl({
    src: ['../assets/capture.mp3'],
  });
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
    console.log(puzzle);
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
            if (isPromotion(orig, this.chess)) {
              this.handlePromotion(orig, dest);
            } else {
              this.onMove(orig, dest);
            }
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
    const puzzle = {
      puzzleid: 'FElHP',
      fen: '8/p3K3/8/3Pk3/5N2/2p5/P7/8 w - - 0 56',
      rating: 1469,
      ratingdeviation: 500,
      moves: ['d5d6', 'e5f4', 'd6d7', 'c3c2', 'd7d8q', 'c2c1q'],
      themes: [
        'advancedPawn',
        'endgame',
        'equality',
        'hangingPiece',
        'long',
        'promotion',
      ],
    };
    this.initChessground(puzzle, el);
    // this.http
    //   .get<any>(env.chessApiUrl, {
    //     headers: this.apiHeaders,
    //     params: { themes: '["promotion"]', count: '1' },
    //   })
    //   .subscribe((next) => {
    //     this.initChessground(next.puzzles[0], el);
    //   });
  }

  private makeMove(from: Key, to: Key, promotion?: string) {
    this.chess.move({ from: from, to: to, promotion: promotion });
    this.playSound();
    this.cg.set({
      fen: this.chess.fen(),
      turnColor: toColour(this.chess),
      movable: {
        color: toColour(this.chess),
        dests: getLegalMoves(this.chess),
      },
      check: this.chess.inCheck(),
    });
  }

  private makeCpuMove(from: Key, to: Key, promotion?: string) {
    if (promotion) {
      this.cg.setPieces(
        new Map<Key, Piece | undefined>([
          [
            to,
            {
              role: convertPromotionPiece(promotion),
              color: toColour(this.chess),
              promoted: true,
            },
          ],
          [from, undefined],
        ])
      );
      this.makeMove(from, to, promotion);
    } else {
      this.makeMove(from, to);
    }
  }

  private onMove(orig: Key, dest: Key, promotion?: string) {
    this.cg.setAutoShapes([]);
    // If there's moves remaining in the set
    if (this.currentMove < this.moves.length - 1) {
      if (this.isCorrect(orig, dest, promotion)) {
        this.onRightMove(orig, dest, promotion);
      } else {
        this.onWrongMove(orig, dest);
      }
    } else {
      // If final move
      if (this.isCorrect(orig, dest, promotion)) {
        this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.right }]);
        this.makeMove(orig, dest, promotion);
        this.cg.stop();
        this.puzzleComplete$.next(true);
      } else {
        this.onWrongMove(orig, dest, promotion);
      }
    }
  }

  private onRightMove(orig: Key, dest: Key, promotion?: string) {
    this.lastMoveCorrect$.next(true);
    this.currentMove++;
    this.makeMove(orig, dest, promotion);
    this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.right }]);
    setTimeout(() => {
      let { from, to, promotion } = convertSingleMove(
        this.moves[this.currentMove]
      );
      this.makeCpuMove(from as Key, to as Key, promotion);
      this.currentMove++;
    }, 250);
  }

  private onWrongMove(orig: Key, dest: Key, promotion?: string) {
    if (promotion) {
      this.cg.setPieces(getWrongPromotionSquares(dest));
    }
    this.puzzleFailed$.next(true);
    this.lastMoveCorrect$.next(false);
    this.chess.move({ from: orig, to: dest, promotion: promotion });
    this.playSound();
    this.cg.set({ check: this.chess.inCheck() });
    this.cg.setAutoShapes([{ orig: dest, customSvg: boardSvgs.wrong }]);
    this.cg.stop();
  }

  private isCorrect(orig: Key, dest: Key, promotion?: string) {
    let move = '';
    move = promotion
      ? move.concat(orig, dest, promotion)
      : move.concat(orig, dest);
    return move === this.moves[this.currentMove];
  }

  private makeFirstMove() {
    let move = convertSingleMove(this.moves[0]);
    this.makeMove(move.from as Key, move.to as Key);
    this.currentMove = 1;
  }

  private playSound() {
    let lastMove = getLastMove(this.chess);
    if (this.chess.inCheck()) {
      this.checkSound.play();
    } else if (lastMove.captured) {
      this.captureSound.play();
    } else {
      this.moveSound.play();
    }
  }

  private handlePromotion(orig: Key, dest: Key) {
    this.cg.setAutoShapes([]);
    // Save any PiecesDiff on ranks 3,4 5,6 to add them back in after promotion
    this.cg.setPieces(
      new Map<Key, Piece>(getPromotionDisplaySquares(dest, this.chess))
    );
    for (const i of getPromotionDisplaySquares(dest, this.chess)) {
      this.cg.selectSquare(i[0], true);
    }
    // this.cg.stop();
    this.cg.set({
      events: {
        select: (key) => this.handlePromotionSelection(key, orig, dest),
      },
    });
  }

  private handlePromotionSelection(key: Key, orig: Key, dest: Key) {
    const selection = key.split('')[1];
    let piece = '';
    if (selection == '1' || selection == '8') {
      piece = 'q';
    } else if (selection == '2' || selection == '7') {
      piece = 'r';
    } else if (selection == '3' || selection == '6') {
      piece = 'n';
    } else if (selection == '4' || selection == '5') {
      piece = 'b';
    }

    this.cg.set({ events: { select: undefined } });
    this.cg.setPieces(
      new Map<Key, Piece | undefined>([
        [
          dest,
          {
            role: convertPromotionPiece(piece),
            color: toColour(this.chess),
            promoted: true,
          },
        ],
        [orig, undefined],
      ])
    );
    this.onMove(orig, dest, piece);
  }
}
