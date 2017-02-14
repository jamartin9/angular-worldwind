import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MenubarModule, MenuModule, MessagesModule } from 'primeng/primeng';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { WorldwindComponent } from './worldwind/worldwind.component';

// routes needed for primeng
const appRoutes: Routes = [
  { path: '', component: WorldwindComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    WorldwindComponent 
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MenubarModule,
    MenuModule,
    MessagesModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
