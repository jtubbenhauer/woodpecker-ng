import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState: any = null;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.authState.subscribe(
      (authState) => (this.authState = authState)
    );
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
