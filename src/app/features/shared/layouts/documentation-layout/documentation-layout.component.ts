import { Component, OnInit } from '@angular/core';
import { DocsMenuService } from '../../../documentation/services/docs-menu.service';

@Component({
    selector: 'app-documentation-layout',
    templateUrl: './documentation-layout.component.html',
    styleUrls: ['./documentation-layout.component.scss'],
    standalone: false
})
export class DocumentationLayoutComponent implements OnInit {

  _opened: boolean = true;

  sidebarConfig: any = {
    dock: false,
    mode: 'push',
    sidebarClass: 'doc-side-menu'
  }

  constructor(
    private docMenu: DocsMenuService
  ) { }

  ngOnInit(): void {
  }

  updateConfig(screenWidth: number) {
    if (screenWidth <= 900) {
      this.sidebarConfig['mode'] = 'over';
      this.sidebarConfig['dock'] = true;
      this._opened = false;
      this.sidebarConfig['showBackdrop'] = true;
    } else {
      this.sidebarConfig['mode'] = 'push';
      this.sidebarConfig['showBackdrop'] = false;
      this._opened = true;
    }
  }

  toggleSidebar() {
    this._opened = !this._opened;
  }

  onSelectMenu(menu: string) {
    this.docMenu.onChangeMenu(menu);
  }

}
