// src/app/layouts/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header.component/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component/sidebar.component';
import { FooterComponent } from '../../footer/footer.component/footer.component';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  onSidebarToggle(collapsed: boolean): void {
  // console.log('collapse:', collapsed);
    this.isSidebarCollapsed = collapsed;
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }
}
