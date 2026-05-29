// directives/menu-loader.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MenuItem } from '../models/menu.model';

// export interface MenuItem {
//   menuItemId: number;
//   parentMenuItemId: number | null;
//   menuTitle: string;
//   menuIcon: string;
//   routerLink: string | null;
//   menuOrder: number;
//   isActive: boolean;
//   isVisible: boolean;
//   children?: MenuItem[];
// }

@Directive({
  selector: '[appMenuLoader]',
  standalone: true
})
export class MenuLoaderDirective implements OnInit, OnDestroy {
  @Input('appMenuLoader') menus: MenuItem[] = [];
  @Input() isCollapsed = false;

  private openSubmenus = new Set<number>();
  private routerSubscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private router: Router
  ) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveState();
    });
  }

  ngOnInit() {
    this.render();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private render() {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this.menus,
      isCollapsed: this.isCollapsed,
      toggleSubmenu: (menu: MenuItem) => this.toggleSubmenu(menu),
      isSubmenuOpen: (menu: MenuItem) => this.isSubmenuOpen(menu),
      isMenuActive: (menu: MenuItem) => this.isMenuActive(menu),
      isChildActive: (menu: MenuItem) => this.isChildActive(menu),
      logMenuClick: (menu: MenuItem) => this.logMenuClick(menu)
    });
  }

  private toggleSubmenu(menu: MenuItem) {
    if (this.openSubmenus.has(menu.menuItemId)) {
      this.openSubmenus.delete(menu.menuItemId);
    } else {
      this.openSubmenus.add(menu.menuItemId);
    }
    this.render(); // re-render to reflect changes
  }

  private isSubmenuOpen(menu: MenuItem): boolean {
    return this.openSubmenus.has(menu.menuItemId);
  }

  private isMenuActive(menu: MenuItem): boolean {
    if (!menu.routerLink) return false;
    return this.router.url === menu.routerLink;
  }

  private isChildActive(menu: MenuItem): boolean {
    if (!menu.children) return false;
    return menu.children.some(child => this.router.url === child.routerLink);
  }

  private updateActiveState() {
    // Force re-render to update active classes
    this.render();
  }

  private logMenuClick(menu: MenuItem) {
    console.log('Menu clicked:', menu.menuTitle);
    // You can add analytics or other logic here
  }
}
