import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import User = firebase.User;
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user?: User | null;
  userSub?: Subscription;

  constructor(
    public auth: AngularFireAuth,
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((next) => {
      this.user = next;
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
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
