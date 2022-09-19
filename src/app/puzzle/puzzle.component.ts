import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../services/chess.service';
import { BoardComponent } from './board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreService } from '../services/firestore.service';

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
  user!: User | null;

  constructor(
    private chessService: ChessService,
    private auth: AngularFireAuth,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.chessService.puzzleComplete$.subscribe(
      (next) => (this.puzzleComplete = next)
    );
    this.auth.user.subscribe((next) => (this.user = next));
  }

  ngAfterViewInit(): void {
    // this.service.initChessground(this.boardChild.el.nativeElement);
    this.chessService.getRandomPuzzle(this.boardChild.el.nativeElement);
    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });
  }

  randomPuzzle() {
    this.chessService.getRandomPuzzle(this.boardChild.el.nativeElement);
  }

  newSet() {
    this.firestoreService.newSet(this.user);
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
