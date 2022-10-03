import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { first, Observable } from 'rxjs';
import firebase from 'firebase/compat';
import User = firebase.User;
import { SetWithId } from '../../../components/set-card/set-card.component';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  items$?: Observable<SetWithId[]>;
  user?: User | null;

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.authService.user
      .pipe(first())
      .subscribe(
        (next) => (this.items$ = this.userDataService.getSets(next?.uid))
      );
  }

  ngOnInit() {
    this.userDataService.isLoading.subscribe((next) =>
      next ? this.spinner.show() : this.spinner.hide()
    );
  }
}
