import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpecificationsWidget } from '../../interfaces/specifications-widget';

@Component({
    selector: 'xchange-specifications-widget',
    templateUrl: './xchange-specifications-widget.component.html',
    styleUrls: ['./xchange-specifications-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class XchangeSpecificationsWidgetComponent implements OnInit {

  @Input('specifications') specifications!: SpecificationsWidget;
  @Output() onClick = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }
  clickOnUrl(url: any) {
    this.onClick.emit(url);
  }

}
