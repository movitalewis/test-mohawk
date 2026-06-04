import { Component, OnInit } from '@angular/core';
import { faUserLock, faAddressCard, faAngleLeft } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-register-options-page',
    templateUrl: './register-options-page.component.html',
    styleUrls: ['./register-options-page.component.scss'],
    standalone: false
})
export class RegisterOptionsPageComponent implements OnInit {
lock = faUserLock
computer = faAddressCard
arrow = faAngleLeft
  constructor() { }

  ngOnInit(): void {
  }

}
