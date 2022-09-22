import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat';
import User = firebase.User;
import { Set } from '../../../models/set';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  collection?: AngularFirestoreCollection<unknown> | null;
  items$?: Observable<Set[]>;
  user?: User | null;

  constructor(
    private userDataService: UserDataService,
    private auth: AngularFireAuth
  ) {
    this.auth.user.subscribe(
      (next) => (this.items$ = this.userDataService.getSets(next?.uid))
    );
  }

  ngOnInit() {}
}
