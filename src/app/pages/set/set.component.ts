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
import { randomArrayEl } from '../../utils/utils';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.css'],
})
export class SetComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  showEndButtons = false;
  puzzleComplete!: boolean;
  puzzleTime!: number;
  puzzleTimeDisplay = { hours: '', minutes: '00', seconds: '00' };
  totalTimeDisplay = { hours: '', minutes: '00', seconds: '00' };
  bestTimeDisplay = { hours: '', minutes: '00', seconds: '00' };
  interval: any;
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
    this.authSub = this.authService.user.pipe(first()).subscribe((next) => {
      this.user = next;
      this.route.queryParams.pipe(first()).subscribe((params) => {
        this.setId = params['id'];
        if (this.user && this.setId) {
          this.userDataService
            .getOneSet(this.user, this.setId)
            .forEach((set) => {
              this.setData = set;
              this.totalTimeDisplay = this.timeToString(
                this.setData.currentTime
              );
              this.bestTimeDisplay = this.timeToString(this.setData.bestTime);
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

    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showEndButtons = next)
    );

    this.completeSub = this.chessService.puzzleComplete$.subscribe((next) => {
      if (this.user && next && !this.updatedIncorrect) {
        this.puzzleComplete = next;
        this.userDataService.updateCorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle,
          this.puzzleTime
        );
        clearInterval(this.interval);
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
          this.currentPuzzle,
          this.puzzleTime
        );
        clearInterval(this.interval);
      }
    });
  }

  ngOnDestroy() {
    this.completeSub?.unsubscribe();
    this.puzzleFailed.unsubscribe();
    this.authSub?.unsubscribe();
  }

  ngAfterViewInit() {}

  getNextPuzzle() {
    this.startTimer();
    this.puzzleComplete = false;
    this.showEndButtons = true;
    this.updatedIncorrect = false;
    this.incompletePuzzles$.pipe(first()).subscribe((next) => {
      this.currentPuzzle = randomArrayEl(next);
      this.chessService.initChessground(
        this.currentPuzzle,
        this.boardChild.el.nativeElement
      );
    });
  }

  startTimer() {
    this.puzzleTime = 0;
    this.puzzleTimeDisplay = { hours: '0', minutes: '0', seconds: '00' };
    let start = Date.now();

    this.interval = setInterval(() => {
      let delta = Date.now() - start;
      this.puzzleTime = Math.floor(delta / 1000);
      this.puzzleTimeDisplay = this.timeToString(this.puzzleTime);
    }, 1000);
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

  timeToString(time: number) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = time % 60;
    let minuteString =
      minutes.toString().length == 1
        ? `0${minutes.toString()}`
        : minutes.toString();
    let secondString =
      seconds.toString().length == 1
        ? `0${seconds.toString()}`
        : seconds.toString();
    return {
      hours: hours.toString(),
      minutes: minuteString,
      seconds: secondString,
    };
  }

  //Make Forward one and new buttons for them
}
