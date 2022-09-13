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
export class ChessgroundService {
  puzzle!: puzzles;

  constructor(private http: HttpClient) {}

  getRandomPuzzle():Observable<puzzles> {
    return this.http.get<puzzles>('http://localhost:3000/puzzle/random');
  }

  initChessground(el: HTMLElement, chess: Chess):any {
    this.getRandomPuzzle().subscribe({next: (puzzle) => {
      return Chessground(el, {fen:chess.fen()})
      }})
  }
}
