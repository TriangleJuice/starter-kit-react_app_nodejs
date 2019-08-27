import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public userData: any;

  constructor(
    private userService: UserService) { }

  ngOnInit() {
    this.userService.getUser().then((resp) => {
      resp.json().then((data) => {
        this.userData = data.user;
      });
    });
  }
}
