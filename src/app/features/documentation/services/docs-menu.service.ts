import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocsMenuService {

  private currentMenu = new BehaviorSubject<string>('');
  menuName = this.currentMenu.asObservable()

  constructor() { }

  onChangeMenu(name: string) {
    this.currentMenu.next(name);
  }
}
