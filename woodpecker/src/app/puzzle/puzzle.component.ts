import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Api } from 'chessground/api';
import { ChessgroundService } from '../chessground.service';
import { BoardComponent } from './board/board.component';
import { Chess } from 'chess.js';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
})
export class PuzzleComponent implements OnInit, AfterViewInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  cg!: Api;
  chess!: Chess;

  constructor(private service: ChessgroundService) {}

  ngOnInit(): void {
    this.chess = new Chess();
  }

  ngAfterViewInit(): void {
    this.cg = this.service.initChessground(
      this.boardChild.el.nativeElement,
      this.chess
    );
    console.log(this.chess)
  }
}
