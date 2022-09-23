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
import { first, Observable } from 'rxjs';
import { Set } from '../models/set';
import { SetWithId } from '../components/setCard/set-card/set-card.component';
import { Puzzle } from '../models/puzzle';

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

  getSets(uid: string | undefined): Observable<SetWithId[]> {
    return this.afs
      .collection<Set>(`users/${uid}/sets`)
      .valueChanges({ idField: 'id' });
  }

  getOneSet(user: User, uid: string): Observable<any> {
    return this.afs
      .doc(`users/${user.uid}/sets/${uid}`)
      .valueChanges()
      .pipe(first());
  }

  getSetPuzzles(user: User, uid: string): Observable<any> {
    return this.afs
      .collection(`users/${user.uid}/sets/${uid}/puzzles`)
      .valueChanges()
      .pipe(first());
  }

  getCompletePuzzles(user: User, setId: string): Observable<Puzzle[]> {
    const path = `users/${user.uid}/sets/${setId}/puzzles`;
    return this.afs
      .collection<Puzzle>(path, (ref) => ref.where('completed', '==', true))
      .valueChanges();
  }

  getIncompletePuzzles(user: User, setId: string): Observable<Puzzle[]> {
    const path = `users/${user.uid}/sets/${setId}/puzzles`;
    return this.afs
      .collection<Puzzle>(path, (ref) => ref.where('completed', '==', false))
      .valueChanges();
  }

  updateCorrectPuzzle(user: User, setId: string, puzzle: Puzzle) {
    const path = `users/${user.uid}/sets/${setId}/puzzles`;
    this.afs
      .collection(path, (ref) => ref.where('puzzleid', '==', puzzle.puzzleid))
      .snapshotChanges()
      .pipe(first())
      .forEach((value) =>
        this.afs
          .doc(`${path}/${value[0].payload.doc.id}`)
          .update({ ...puzzle, completed: true })
      );
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
