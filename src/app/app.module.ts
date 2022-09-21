import { NgModule } from '@angular/core';
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
import { SetCardComponent } from './components/setCard/set-card/set-card.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SetComponent,
    BoardComponent,
    NewSetComponent,
    HomeComponent,
    SetCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
