import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MenubarModule, MenuModule, MessagesModule, GrowlModule, InputTextModule, DialogModule, BlockUIModule, ButtonModule } from 'primeng/primeng';
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
    BlockUIModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MenubarModule,
    MenuModule,
    MessagesModule,
    GrowlModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
