import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { BoardComponent } from './puzzle/board/board.component';
import { HttpClientModule } from '@angular/common/http';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {firebaseConfig} from './firebase'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PuzzleComponent,
    BoardComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, AngularFireModule.initializeApp(firebaseConfig), AngularFireAuthModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
