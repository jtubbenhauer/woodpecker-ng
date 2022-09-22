import { Component, OnInit, ViewChild } from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { Set } from '../../models/set';
import { UserDataService } from '../../services/user-data.service';
import { Puzzle } from '../../models/puzzle';
import { randomArrayEl } from '../../utils/utils';
import { first } from 'rxjs';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.css'],
})
export class SetComponent implements OnInit {
  @ViewChild(BoardComponent) boardChild!: BoardComponent;
  showBackButton = false;
  puzzleComplete!: boolean;
  toMove?: string;
  user!: User | null;
  setId!: string;
  setData!: Set;
  puzzles!: Puzzle[];
  completePuzzles!: Puzzle[];
  incompletePuzzles!: Puzzle[];
  currentPuzzle!: Puzzle;

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
          this.userDataService
            .getOneSet(this.user, this.setId)
            .pipe(first())
            .subscribe((next) => {
              this.setData = next;
            });
          this.userDataService
            .getSetPuzzles(this.user, this.setId)
            .subscribe((next) => {
              this.puzzles = next;
              this.splitPuzzles();
              this.getNextPuzzle();
            });
        }
      });
    });

    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.chessService.puzzleComplete$.subscribe((next) => {
      this.puzzleComplete = next;
      if (this.user) {
        this.userDataService.updateCorrectPuzzle(
          this.user,
          this.setId,
          this.currentPuzzle
        );
      }
      // this.puzzles
      //   .filter((puzzle) => puzzle.puzzleid == this.currentPuzzle?.puzzleid)
      //   .forEach((puzzle) => (puzzle.completed = true));
      // Update setPuzzles in one hit here
      this.splitPuzzles();
    });
    this.chessService.currentColour$.subscribe((value) => {
      this.toMove = value;
    });
  }

  splitPuzzles() {
    this.completePuzzles = this.puzzles.filter((puzzle) => {
      return puzzle.completed;
    });

    this.incompletePuzzles = this.puzzles.filter((puzzle) => {
      return !puzzle.completed;
    });
  }

  getNextPuzzle() {
    // Mark puzzle as completed, split, write to db?
    this.currentPuzzle = randomArrayEl(this.incompletePuzzles);
    this.chessService.initChessground(
      this.currentPuzzle,
      this.boardChild.el.nativeElement
    );
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
