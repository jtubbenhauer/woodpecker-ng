import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import User = firebase.User;
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user?: User | null;

  constructor(
    public auth: AngularFireAuth,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe((next) => {
      this.user = next;
    });
  }

  login() {
    this.auth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((value) => {
        this.userDataService.createUserDoc(value.user);
      });
  }

  logout() {
    this.auth.signOut();
  }
}
