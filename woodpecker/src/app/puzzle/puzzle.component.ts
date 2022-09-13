import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../chess.service';
import { BoardComponent } from './board/board.component';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
})
export class PuzzleComponent implements OnInit, AfterViewInit {

  @ViewChild(BoardComponent) boardChild!: BoardComponent;

  constructor(private service: ChessService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.service.initChessground(
      this.boardChild.el.nativeElement,
    );
  }

  handleRandomPuzzle() {
    this.service.initChessground(
      this.boardChild.el.nativeElement,
    );
  }
}
