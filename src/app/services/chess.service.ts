import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { Puzzle } from '../models/puzzle';
import { BehaviorSubject, Subject } from 'rxjs';
import { Api } from 'chessground/api';
import { Key, Piece } from 'chessground/types';
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
  puzzleComplete$ = new BehaviorSubject<boolean>(false);
  puzzleFailed$ = new BehaviorSubject<boolean>(false);
  moveSound = new Howl({
    src: ['../assets/move.mp3'],
  });
  checkSound = new Howl({
    src: ['../assets/check.mp3'],
  });
  captureSound = new Howl({
    src: ['../assets/capture.mp3'],
  });
  promotionSound = new Howl({
    src: ['../assets/promotion.mp3'],
  });

  constructor() {}

  public initChessground(puzzle: any, el: HTMLElement): any {
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
        color: 'both',
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

  private makeMove(from: Key, to: Key, promotion?: string) {
    this.chess.move({ from: from, to: to, promotion: promotion });
    this.playSound(promotion);
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
        this.onWrongMove(orig, dest, promotion);
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
    this.playSound(promotion);
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
    let { from, to, promotion } = convertSingleMove(this.moves[0]);
    this.makeMove(from, to, promotion);
    this.currentMove = 1;
  }

  private playSound(promotion?: string) {
    let lastMove = getLastMove(this.chess);
    if (promotion && !this.chess.inCheck()) {
      this.promotionSound.play();
    } else if (this.chess.inCheck()) {
      this.checkSound.play();
    } else if (lastMove.captured) {
      this.captureSound.play();
    } else {
      this.moveSound.play();
    }
  }

  private handlePromotion(orig: Key, dest: Key) {
    this.cg.setAutoShapes([]);
    console.log(orig, dest);
    this.cg.setPieces(
      new Map<Key, Piece>(getPromotionDisplaySquares(dest, this.chess))
    );
    // This is the right idea but looks shit
    // for (const i of getPromotionDisplaySquares(dest, this.chess)) {
    //   this.cg.selectSquare(i[0], true);
    // }
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
