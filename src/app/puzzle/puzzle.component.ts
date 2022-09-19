import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../services/chess.service';
import { BoardComponent } from './board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  user?: User | null;

  constructor(private service: ChessService, private auth: AngularFireAuth) {}

  ngOnInit(): void {
    this.service.lastMoveCorrect.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.service.puzzleComplete.subscribe(
      (next) => (this.puzzleComplete = next)
    );
    this.auth.user.subscribe((next) => (this.user = next));
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
