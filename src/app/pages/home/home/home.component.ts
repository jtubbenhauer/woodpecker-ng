import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { first, Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat';
import User = firebase.User;
import { SetWithId } from '../../../components/setCard/set-card/set-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  collection?: AngularFirestoreCollection<unknown> | null;
  items$?: Observable<SetWithId[]>;
  user?: User | null;

  constructor(
    private userDataService: UserDataService,
    private auth: AngularFireAuth
  ) {
    this.auth.user
      .pipe(first())
      .subscribe(
        (next) => (this.items$ = this.userDataService.getSets(next?.uid))
      );
  }

  ngOnInit() {}
}
