import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-site-footer',
    templateUrl: './site-footer.component.html',
    styleUrls: ['./site-footer.component.scss'],
    standalone: false
})
export class SiteFooterComponent implements OnInit {

  currentYear: number = new Date().getFullYear();
  project: string = '';
  constructor(private ar: ActivatedRoute
    ) {
      this.project = this.ar.snapshot?.data['project'];
    }
  ngOnInit(): void {
  }

}
