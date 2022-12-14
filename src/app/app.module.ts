import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SetComponent } from './pages/set/set.component';
import { BoardComponent } from './components/board/board.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from './firebase';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { NewSetComponent } from './components/dialogs/new-set/new-set.component';
import { HomeComponent } from './pages/home/home/home.component';
import { SetCardComponent } from './components/set-card/set-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { WinRateRadialsComponent } from './components/win-rate-radials/win-rate-radials.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { SetInfoComponent } from './components/set-info/set-info.component';
import { PuzzleTimePipe } from './pipes/puzzle-time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SetComponent,
    BoardComponent,
    NewSetComponent,
    HomeComponent,
    SetCardComponent,
    WinRateRadialsComponent,
    ProgressBarComponent,
    SetInfoComponent,
    PuzzleTimePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
