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
  showBackButton!: boolean;
  puzzleComplete!: boolean;
  toMove = '';

  constructor(private service: ChessService) {}

  ngOnInit(): void {
    this.service.lastMoveCorrect.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.service.puzzleComplete.subscribe(
      (next) => (this.puzzleComplete = next)
    );
  }

  ngAfterViewInit(): void {
    // this.service.initChessground(this.boardChild.el.nativeElement);
    this.service.getRandomPuzzle(this.boardChild.el.nativeElement);
    this.service.currentColour.subscribe((value) => {
      this.toMove = value;
    });
  }

  randomPuzzle() {
    this.service.getRandomPuzzle(this.boardChild.el.nativeElement);
  }

  resetPuzzle() {
    this.service.resetPuzzle();
  }

  getHint() {
    this.service.getHint();
  }

  getPromotion() {
    this.service.getPromPuzzle(this.boardChild.el.nativeElement);
  }

  backOneMove() {
    this.service.backOne();
  }
}
