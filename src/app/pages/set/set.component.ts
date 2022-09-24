import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { Puzzle } from '../../models/puzzle';
import { randomArrayEl } from '../../utils/utils';
import { first, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.css'],
})
export class SetComponent implements OnInit, OnDestroy {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  showBackButton = false;
  puzzleComplete!: boolean;
  toMove?: string;
  user!: User | null;
  setId!: string;
  puzzles!: Puzzle[];
  currentPuzzle!: Puzzle;
  totalPuzzles?: number;
  numCompleted!: number;
  numIncomplete!: number;
  incompletePuzzles$!: Observable<Puzzle[]>;
  completedPuzzles$!: Observable<Puzzle[]>;
  completeSub!: Subscription;
  puzzleFailed!: Subscription;
  updatedIncorrect = false;

  constructor(
    private chessService: ChessService,
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe((next) => {
      this.user = next;
      this.route.queryParams.subscribe((params) => {
        this.setId = params['id'];
        if (this.user && this.setId) {
          this.completedPuzzles$ = this.userDataService.getCompletePuzzles(
            this.user,
            this.setId
          );
          this.incompletePuzzles$ = this.userDataService.getIncompletePuzzles(
            this.user,
            this.setId
          );
          this.completedPuzzles$.subscribe(
            (next) => (this.numCompleted = next.length)
          );
          this.incompletePuzzles$.subscribe((next) => {
            this.numIncomplete = next.length;
            this.totalPuzzles = this.numCompleted + this.numIncomplete;
          });

          this.getNextPuzzle();
        }
      });
    });

    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.completeSub = this.chessService.puzzleComplete$.subscribe((next) => {
      if (this.user && next) {
        this.puzzleComplete = next;
        this.userDataService.updateCorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle
        );
      }
    });

    this.puzzleFailed = this.chessService.puzzleFailed$.subscribe((next) => {
      if (next && this.user && !this.updatedIncorrect) {
        this.updatedIncorrect = true;
        this.userDataService.updateIncorrectPuzzle(this.user, this.setId);
      }
    });
    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });

    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });
  }

  ngOnDestroy() {
    this.completeSub?.unsubscribe();
    this.puzzleFailed.unsubscribe();
  }

  getNextPuzzle() {
    this.puzzleComplete = false;
    this.updatedIncorrect = false;
    this.incompletePuzzles$.pipe(first()).subscribe((next) => {
      this.currentPuzzle = randomArrayEl(next);
      this.chessService.initChessground(
        this.currentPuzzle,
        this.boardChild.el.nativeElement
      );
    });
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

  //Make Forward one and new buttons for them
}
