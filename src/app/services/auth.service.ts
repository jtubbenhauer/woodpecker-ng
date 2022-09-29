import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat';
import User = firebase.User;
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.user = this.afAuth.user;
  }

  emailLogin(email: string, password: string) {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((value) => {
        console.log('logged in');
        this.router.navigateByUrl('/');
      })
      .catch((err) => console.log(err));
  }

  emailSignUp(email: string, password: string) {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((value) => {
        console.log('signed up');
        this.router.navigateByUrl('/');
      })
      .catch((err) => console.log(err));
  }
}
