import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.css'],
})
export class SetComponent implements OnInit, AfterViewInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  showBackButton = false;
  puzzleComplete!: boolean;
  toMove?: string;
  user?: User | null;

  constructor(
    private chessService: ChessService,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.chessService.puzzleComplete$.subscribe(
      (next) => (this.puzzleComplete = next)
    );
    this.auth.user.subscribe((next) => (this.user = next));
    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });
  }

  ngAfterViewInit(): void {
    this.chessService.getRandomPuzzle(this.boardChild.el.nativeElement);
  }

  randomPuzzle() {
    this.chessService.getRandomPuzzle(this.boardChild.el.nativeElement);
  }

  resetPuzzle() {
    this.chessService.resetPuzzle();
  }

  getHint() {
    this.chessService.getHint();
  }

  getPromotion() {
    this.chessService.getPromPuzzle(this.boardChild.el.nativeElement);
  }

  backOneMove() {
    this.chessService.backOne();
  }
}
