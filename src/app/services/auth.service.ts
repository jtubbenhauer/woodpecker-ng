import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
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

  getLoggedInUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigateByUrl('/');
    });
  }

  setUserToLocalStorage(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}
