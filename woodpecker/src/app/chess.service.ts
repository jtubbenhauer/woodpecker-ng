import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess, Square, SQUARES } from 'chess.js';
import { HttpClient } from '@angular/common/http';
import { Puzzle } from 'prismaclient';
import { BehaviorSubject, Observable } from 'rxjs';
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
  feedbackMessage = new BehaviorSubject('Make a move');
  currentColour = new BehaviorSubject('');
  lastMoveCorrect = new BehaviorSubject(true);
  puzzleComplete = new BehaviorSubject(false);
  audio = new Audio();

  svgs = {
    right: `<g transform="translate(60 2)" >
            <svg id="Layer_1" enable-background="new 0 0 512 512" height="40" viewBox="0 0 512 512" width="40"
                xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="m256 0c-141.2 0-256 114.8-256 256s114.8 256 256 256 256-114.8 256-256-114.8-256-256-256z"
                fill="#4bae4f" fill-rule="evenodd"/>
                <path
                  d="m206.7 373.1c-32.7-32.7-65.2-65.7-98-98.4-3.6-3.6-3.6-9.6 0-13.2l37.7-37.7c3.6-3.6 9.6-3.6 13.2 0l53.9 53.9 138.6-138.7c3.7-3.6 9.6-3.6 13.3 0l37.8 37.8c3.7 3.7 3.7 9.6 0 13.2l-183.3 183.1c-3.6 3.7-9.5 3.7-13.2 0z"
                fill="#fff"/>
                </svg>
            </g>`,
    wrong: `<g transform="translate(60 2)">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path xmlns="http://www.w3.org/2000/svg" d="m256 0c-141.164062 0-256 114.835938-256 256s114.835938 256 256 256 256-114.835938 256-256-114.835938-256-256-256zm0 0" fill="#f44336" data-original="#f44336" class=""/><path xmlns="http://www.w3.org/2000/svg" d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0" fill="#fafafa" data-original="#fafafa" class=""/></g></svg>
            </g>`,
  };

  constructor(private http: HttpClient) {}

  public resetPuzzle() {
    this.puzzleComplete.next(false);
    this.cg.setAutoShapes([]);
    this.currentMove = 0;
    this.chess = new Chess(this.puzzle.fen);
    this.cg.set({
      fen: this.chess.fen(),
      check: this.chess.isCheck(),
    });
    this.moves = this.movesToArr();
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
    this.lastMoveCorrect.next(true);
  }

  public getHint() {
    let move = this.convertSingleMove(this.moves[this.currentMove]);
    this.cg.selectSquare(move.from as Key);
  }

  public getPromPuzzle(el: HTMLElement) {
    this.http
      .get<Puzzle>('http://localhost:3000/puzzle/promotion')
      .subscribe((next) => {
        this.initChessground(next, el);
        console.log(next.moves);
      });
  }

  public getRandomPuzzle(el: HTMLElement) {
    this.http
      .get<Puzzle>('http://localhost:3000/puzzle/random')
      .subscribe((next) => {
        this.initChessground(next, el);
      });
  }

  private initChessground(puzzle: Puzzle, el: HTMLElement): any {
    this.puzzleComplete.next(false);
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
            this.playAudio('check');
          } else if (capturedPiece) {
            this.playAudio('capture');
          } else {
            this.playAudio('move');
          }
        },
      },
      turnColor: this.toColour(),
      orientation: this.getOrientation(),
      check: this.chess.isCheck(),
    });
    this.moves = this.movesToArr();
    this.makeFirstMove();
    this.currentColour.next(this.toColour());
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
        this.cg.setAutoShapes([{ orig: dest, customSvg: this.svgs.right }]);
        this.makeMove(orig, dest);
        this.cg.stop();
        this.puzzleComplete.next(true);
      } else {
        this.onWrongMove(orig, dest);
      }
    }
  }

  private onRightMove(orig: Key, dest: Key) {
    this.feedbackMessage.next('Correct! Keep going');
    this.lastMoveCorrect.next(true);
    this.currentMove++;
    this.makeMove(orig, dest);
    // Make computers next move after delay
    let { from, to } = this.convertSingleMove(this.moves[this.currentMove]);
    this.makeMove(from as Key, to as Key);
    this.cg.setAutoShapes([{ orig: dest, customSvg: this.svgs.right }]);
    this.currentMove++;
  }

  private onWrongMove(orig: Key, dest: Key) {
    this.lastMoveCorrect.next(false);
    this.feedbackMessage.next('Incorrect!');
    this.chess.move({ from: orig, to: dest });
    this.cg.set({ check: this.chess.isCheck() });
    this.cg.setAutoShapes([{ orig: dest, customSvg: this.svgs.wrong }]);
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

  private movesToArr() {
    let arr: Key[] = [];
    this.puzzle.moves.split(' ').map((move) => {
      arr.push(move as Key);
    });
    return arr;
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
