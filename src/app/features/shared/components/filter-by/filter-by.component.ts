import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'filter-by',
    templateUrl: './filter-by.component.html',
    styleUrls: ['./filter-by.component.scss'],
    standalone: false
})
export class FilterByComponent implements OnInit {

  @Input('select') select: Array<any> = [];

  @Input('placeholder') placeholder: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
