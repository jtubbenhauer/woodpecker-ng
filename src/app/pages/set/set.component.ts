import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { Set } from '../../models/set';
import { Puzzle } from '../../models/puzzle';
import { randomArrayEl } from '../../utils/utils';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
  setData!: Set;
  puzzles!: Puzzle[];
  currentPuzzle!: Puzzle;
  numIncomplete!: number;
  incompletePuzzles$!: Observable<Puzzle[]>;
  completeSub!: Subscription;
  puzzleFailed!: Subscription;
  authSub: Subscription | undefined;
  updatedIncorrect = false;

  constructor(
    private chessService: ChessService,
    private route: ActivatedRoute,
    private userDataService: UserDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.user.subscribe((next) => {
      this.user = next;
      this.route.queryParams.subscribe((params) => {
        this.setId = params['id'];
        if (this.user && this.setId) {
          this.userDataService
            .getOneSet(this.user, this.setId)
            .forEach((set) => (this.setData = set));

          this.incompletePuzzles$ = this.userDataService.getIncompletePuzzles(
            this.user,
            this.setId
          );

          this.incompletePuzzles$.subscribe((next) => {
            this.numIncomplete = next.length;
            if (this.numIncomplete == 0 && this.user) {
              this.userDataService.onSetCompletion(
                this.user,
                this.setId,
                this.currentPuzzle
              );
            }
          });
          console.log('user subscriptions');
          this.getNextPuzzle();
        }
      });
    });

    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );

    this.completeSub = this.chessService.puzzleComplete$.subscribe((next) => {
      if (this.user && next && !this.updatedIncorrect) {
        console.log('complete sub');
        this.puzzleComplete = next;
        this.userDataService.updateCorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle
        );
      } else {
        this.puzzleComplete = next;
      }
    });

    this.puzzleFailed = this.chessService.puzzleFailed$.subscribe((next) => {
      if (next && this.user && !this.updatedIncorrect) {
        console.log('puzzle failed sub');
        this.updatedIncorrect = true;
        this.userDataService.updateIncorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle
        );
      }
    });
    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });
  }

  ngOnDestroy() {
    this.completeSub?.unsubscribe();
    this.puzzleFailed.unsubscribe();
    this.authSub?.unsubscribe();
  }

  getNextPuzzle() {
    this.puzzleComplete = false;
    this.updatedIncorrect = false;
    this.incompletePuzzles$.pipe(first()).subscribe((next) => {
      // this.currentPuzzle = randomArrayEl(next);
      this.currentPuzzle = {
        rating: 1079,
        completed: false,
        puzzleid: 'YDrWh',
        themes: [
          'advancedPawn',
          'backRankMate',
          'endgame',
          'mate',
          'mateIn2',
          'promotion',
          'short',
        ],
        fen: '5r1k/p2P2pp/4Q3/2p5/Pp1q4/5B2/4P1KP/8 b - - 6 30',
        ratingdeviation: 88,
        moves: ['f8d8', 'e6e8', 'd8e8', 'd7e8q'],
      };
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

  backOneMove() {
    this.chessService.backOne();
  }

  //Make Forward one and new buttons for them
}
