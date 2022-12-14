import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { Set } from '../../models/set';
import { Puzzle } from '../../models/puzzle';
import { randomArrayEl, timeToString } from '../../utils/utils';
import { first, Observable, Subscription, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SetService } from '../../services/set.service';
import { PuzzleTimeFormat } from '../../models/PuzzleTimeFormat';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.css'],
})
export class SetComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  puzzleComplete!: boolean;
  totalTimeDisplay: PuzzleTimeFormat = {
    hours: '',
    minutes: '00',
    seconds: '00',
  };
  bestTimeDisplay: PuzzleTimeFormat = {
    hours: '',
    minutes: '00',
    seconds: '00',
  };
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
    public chessService: ChessService,
    public setService: SetService,
    private route: ActivatedRoute,
    private userDataService: UserDataService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    this.chessService.initChessPuzzle(this.boardChild.el.nativeElement);
  }

  ngOnInit(): void {
    clearInterval(this.setService.interval);
    this.authSub = this.authService.user.pipe(take(1)).subscribe((next) => {
      this.user = next;
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        this.setId = params['id'];
        if (this.user && this.setId) {
          this.userDataService
            .getOneSet(this.user, this.setId)
            .forEach((set) => {
              this.setData = set;
              this.totalTimeDisplay = timeToString(this.setData.currentTime);
              this.bestTimeDisplay = timeToString(this.setData.bestTime);
            });

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
          this.getNextPuzzle();
        }
      });
    });

    this.completeSub = this.chessService.puzzleComplete$.subscribe((next) => {
      if (this.user && next && !this.updatedIncorrect) {
        this.puzzleComplete = next;
        this.userDataService.updateCorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle,
          this.setService.puzzleTime$.getValue()
        );
        clearInterval(this.setService.interval);
        if (this.setService.autoPlay.getValue()) {
          setTimeout(() => this.getNextPuzzle(), 500);
        }
      } else {
        this.puzzleComplete = next;
      }
    });

    this.puzzleFailed = this.chessService.puzzleFailed$.subscribe((next) => {
      if (next && this.user && !this.updatedIncorrect) {
        this.updatedIncorrect = true;
        this.userDataService.updateIncorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle,
          this.setService.puzzleTime$.getValue()
        );
        clearInterval(this.setService.interval);
      }
    });
  }

  ngOnDestroy() {
    this.completeSub?.unsubscribe();
    this.puzzleFailed.unsubscribe();
    this.authSub?.unsubscribe();
  }

  getNextPuzzle() {
    this.setService.startTimer();
    this.puzzleComplete = false;
    this.chessService.lastMoveCorrect$.next(true);
    this.updatedIncorrect = false;
    this.incompletePuzzles$.pipe(first()).subscribe((next) => {
      this.currentPuzzle = randomArrayEl(next);
      this.chessService.initChessground(
        this.currentPuzzle,
        this.boardChild.el.nativeElement
      );
    });
  }

  //Make Forward one and new buttons for them
}
