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
import { Observable } from 'rxjs';
import { Set } from '../models/set';

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

  createUserDoc(user: User | null) {
    if (user) {
      this.afs.doc(`users/${user.uid}`).set({ email: user.email });
    }
  }

  getSets(uid: string | undefined): Observable<Set[]> {
    return this.afs.collection<Set>(`users/${uid}/sets`).valueChanges();
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
        .subscribe((next) => {
          this.userDoc
            ?.collection('sets')
            .add({
              createdAt: new Date(),
              rating: rating,
              puzzleCount: next.puzzles.length,
              timesCompleted: 0,
              currentPuzzleId: next.puzzles[0].puzzleid,
              completed: 0,
            })
            .then((doc) =>
              next.puzzles.map((puzzle) =>
                this.userDoc
                  ?.collection('sets')
                  .doc(`${doc.id}`)
                  .collection('puzzles')
                  .add({ ...puzzle, completed: false })
              )
            );
        });
    }
  }
}
