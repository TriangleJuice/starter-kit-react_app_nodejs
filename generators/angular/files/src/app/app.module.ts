import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AuiModules } from "./aui.modules";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ...AuiModules,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
