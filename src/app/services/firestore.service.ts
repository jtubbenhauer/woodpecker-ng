import {Injectable} from '@angular/core';
import firebase from 'firebase/compat';
import User = firebase.User;
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {envPrivate as env} from "../../environments/env-private";

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  apiHeaders = new HttpHeaders({
    'X-RapidAPI-Key': env.chessApiKey,
    'X-RapidAPI-Host': env.chessApiHost,
  });

  constructor(private http: HttpClient) {
  }

  newSet(user: User | null) {

  }
}
