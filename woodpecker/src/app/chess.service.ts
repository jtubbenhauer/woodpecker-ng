import { Injectable } from '@angular/core';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { HttpClient } from '@angular/common/http';
import { puzzles } from 'prismaclient';
import { Observable } from 'rxjs';
import {Api} from "chessground/api";

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  puzzle!: puzzles;
  cg!:Api
  chess!:Chess;

  constructor(private http: HttpClient) {}

  getRandomPuzzle():Observable<puzzles> {
    return this.http.get<puzzles>('http://localhost:3000/puzzle/random');
  }

  initChessground(el: HTMLElement):any {
    this.getRandomPuzzle().subscribe({next: (puzzle ) => {
        this.chess = new Chess(puzzle.fen)
        this.cg = Chessground(el, {fen: this.chess.fen()})
      }})
  }
}
