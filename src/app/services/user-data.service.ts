import { Injectable } from '@angular/core';
import firebase from 'firebase/compat';
import User = firebase.User;
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { envPrivate as env } from '../../environments/env-private';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { SetDoc, UserDoc } from '../models/userData';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  apiHeaders = new HttpHeaders({
    'X-RapidAPI-Key': env.chessApiKey,
    'X-RapidAPI-Host': env.chessApiHost,
  });

  user?: User | null;
  userDoc?: AngularFirestoreDocument<UserDoc>;

  constructor(
    private http: HttpClient,
    private auth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.auth.user.subscribe((next) => {
      this.user = next;
      this.userDoc = afs.doc(`users/${next?.uid}`);
    });
  }

  newSet(rating: string) {
    if (this.user) {
      this.http
        .get<SetDoc>(env.chessApiUrl, {
          headers: this.apiHeaders,
          params: {
            rating: rating,
            count: '100',
          },
        })
        .subscribe((value) => {
          if (this.user?.email) {
            this.userDoc?.set({ email: this.user.email }).then(() => {
              value.puzzles.map((puzzle) => {
                this.userDoc?.collection('sets').doc().set(puzzle);
              });
            });
          }
        });
    }
  }
}
