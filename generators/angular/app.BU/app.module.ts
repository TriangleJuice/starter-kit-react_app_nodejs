import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { ServiceModule } from './services';
import { AppComponent } from './app.component';
import { AuiModules } from "./aui.modules";
import { Pages } from './pages';

@NgModule({
  declarations: [
    AppComponent,
    ...Pages
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ...AuiModules,
    ServiceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
