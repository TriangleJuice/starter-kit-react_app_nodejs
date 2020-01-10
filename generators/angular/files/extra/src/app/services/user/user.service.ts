import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable()
export class UserService {
  constructor() { }

  public getUser(): Promise<any> {
    return fetch(`/auth/isloggedin`).catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We"d also dig deeper into the error to get a better message
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }
}
