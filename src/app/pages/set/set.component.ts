import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { BoardComponent } from '../../components/board/board.component';
import firebase from 'firebase/compat';
import User = firebase.User;
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Set } from '../../models/set';
import { UserDataService } from '../../services/user-data.service';
import { Observable } from 'rxjs';

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
  setId?: string;
  setData!: Set;

  constructor(
    private chessService: ChessService,
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private userDataService: UserDataService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe((next) => {
      this.user = next;
      this.route.queryParams.subscribe((params) => {
        this.setId = params['id'];
        if (this.user && this.setId) {
          this.userDataService
            .getOneSet(this.user, this.setId)
            .subscribe((next) => (this.setData = next));
        }
      });
    });

    this.chessService.lastMoveCorrect$.subscribe(
      (next) => (this.showBackButton = next)
    );
    this.chessService.puzzleComplete$.subscribe(
      (next) => (this.puzzleComplete = next)
    );
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
