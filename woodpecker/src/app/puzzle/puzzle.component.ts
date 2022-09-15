import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ChessService} from '../chess.service';
import {BoardComponent} from './board/board.component';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
})
export class PuzzleComponent implements OnInit, AfterViewInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  feedbackMessage: string = '';
  showBackButton!: boolean;

  constructor(private service: ChessService) {
  }

  ngOnInit(): void {
    const messageObs = this.service.getFeedbackMessage();
    messageObs.subscribe((message) => {
      this.feedbackMessage = message;
    });
    this.service.lastMoveCorrect.subscribe(
      (obs) => (this.showBackButton = obs)
    );
  }

  ngAfterViewInit(): void {
    this.service.initChessground(this.boardChild.el.nativeElement);
  }

  handleRandomPuzzle() {
    this.service.initChessground(this.boardChild.el.nativeElement);
  }

  handleReset() {
    this.service.resetPuzzle();
  }

  handleGetHint() {
    this.service.getHint();
  }

  handleBackOne() {
    this.service.backOne()
  }
}
