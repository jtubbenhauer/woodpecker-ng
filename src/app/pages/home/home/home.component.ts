import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { Observable, Subscription } from 'rxjs';
import firebase from 'firebase/compat';
import User = firebase.User;
import { SetWithId } from '../../../components/set-card/set-card.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  items$?: Observable<SetWithId[]>;
  user?: User | null;
  userSub?: Subscription;

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService
  ) {
    this.userSub = this.authService.user.subscribe(
      (next) => (this.items$ = this.userDataService.getSets(next?.uid))
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }
}
