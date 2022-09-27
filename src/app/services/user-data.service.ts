import { Injectable } from '@angular/core';
import firebase from 'firebase/compat';
import User = firebase.User;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { envPrivate as env } from '../../environments/env-private';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { increment } from '@angular/fire/firestore';
import { SetDoc, UserDoc } from '../models/userData';
import { first, Observable } from 'rxjs';
import { Set } from '../models/set';
import { SetWithId } from '../components/set-card/set-card.component';
import { Puzzle } from '../models/puzzle';
import Theme from '../models/theme';

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
    return this.afs.doc(`users/${user.uid}/sets/${uid}`).valueChanges();
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
    const path = `users/${user.uid}/sets/${setId}`;
    this.afs
      .collection(`${path}/puzzles`, (ref) =>
        ref.where('puzzleid', '==', puzzle.puzzleid)
      )
      .snapshotChanges()
      .pipe(first())
      .forEach((value) =>
        this.afs
          .doc(`${path}/puzzles/${value[0].payload.doc.id}`)
          .update({ ...puzzle, completed: true })
      );
    this.afs.doc(`${path}`).update({ completed: increment(1) });
  }

  updateIncorrectPuzzle(user: User, setId: string, puzzle: Puzzle) {
    const path = `users/${user.uid}/sets/${setId}`;

    this.afs
      .doc(path)
      .update({ completed: increment(1), failed: increment(1) });

    this.afs
      .collection(`${path}/puzzles`, (ref) =>
        ref.where('puzzleid', '==', puzzle.puzzleid)
      )
      .snapshotChanges()
      .pipe(first())
      .forEach((value) =>
        this.afs
          .doc(`${path}/puzzles/${value[0].payload.doc.id}`)
          .update({ ...puzzle, completed: true })
      );
  }

  deleteSet(setId: string) {
    this.afs.doc(`users/${this.user?.uid}/sets/${setId}`).delete();
  }

  onSetCompletion(user: User, setId: string, puzzle: Puzzle) {
    const setDocRef = this.afs.doc<Set>(
      `users/${this.user?.uid}/sets/${setId}`
    );
    setDocRef.get().subscribe((doc) => {
      let completed = doc.get('completed');
      let failed = doc.get('failed');
      let best = doc.get('best');
      let newRate = ((completed - failed) / completed).toFixed(1);

      if (!best || newRate > best) {
        setDocRef.update({
          timesCompleted: increment(1) as unknown as number,
          best: parseFloat(newRate),
          completed: 0,
          failed: 0,
        });
      } else {
        setDocRef.update({
          timesCompleted: increment(1) as unknown as number,
          completed: 0,
          failed: 0,
        });
      }
    });

    this.resetPuzzleCompletion(user, setId);
  }

  resetPuzzleCompletion(user: User, setId: string) {
    const path = `users/${user.uid}/sets/${setId}/puzzles`;
    this.afs
      .collection(path)
      .get()
      .forEach((query) => {
        query.docs.forEach((puzzle) => puzzle.ref.update({ completed: false }));
      });
  }

  newSet(rating: string, size: string, themes: Array<Theme>) {
    //Want a spinner for this request
    let themeArray = themes.map((theme) => {
      return theme.slug;
    });

    this.http
      .get<SetDoc>(env.chessApiUrl, {
        headers: this.apiHeaders,
        params: {
          rating: rating,
          count: size,
          themes: JSON.stringify(themeArray),
          themesType: 'ONE',
        },
      })
      .pipe(first())
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
            failed: 0,
            themes: themes,
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
