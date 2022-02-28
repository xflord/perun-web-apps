import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SideMenuService } from '../../core/services/common/side-menu.service';
import { AppComponent } from '../../app.component';
import { SideMenuItemService } from './side-menu-item.service';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { rollInOut } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [rollInOut],
})
export class SideMenuComponent implements OnInit {
  @Input()
  sideNav: MatSidenav;

  accessItems: SideMenuItem[] = [];
  facilityItems: SideMenuItem[] = [];
  adminItems: SideMenuItem[] = [];
  homeItems: SideMenuItem[] = [];
  userItems: SideMenuItem[] = [];
  accessItem: SideMenuItem = this.sideMenuItemService.getAccessManagementItem();
  adminItem: SideMenuItem = this.sideMenuItemService.getAdminItem();
  facilityItem: SideMenuItem = this.sideMenuItemService.getFacilitiesManagementItem();
  homeItem: SideMenuItem = this.sideMenuItemService.getHomeItem();
  userItem: SideMenuItem = this.sideMenuItemService.getUserItem();
  mobileView = true;
  adminItemOpened = false;
  userItemOpened = false;

  constructor(
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    public authResolver: GuiAuthResolver
  ) {}

  private static areSameItems(item1: SideMenuItem, item2: SideMenuItem): boolean {
    return item1.label === item2.label && item1.labelClass === item2.labelClass;
  }

  private static areSameLinks(sideMenuItem: SideMenuItem, sideMenuItem2: SideMenuItem): boolean {
    if (sideMenuItem.links.length !== sideMenuItem2.links.length) {
      return false;
    }
    for (let i = 0; i < sideMenuItem.links.length; i++) {
      if (sideMenuItem.links[i].label !== sideMenuItem2.links[i].label) {
        return false;
      }
    }
    return true;
  }

  /**
   * This method is used to set new sideMenuItems to an existing array of items.
   *
   * The method replaces only items that were not int the origin array.
   * If the new array has smaller size, excessive items are removed from the origin array.
   * This method is used because of animations. Without this, they do not work properly.
   *
   * @param originItems origin array
   * @param newItems new items
   */
  private static setNewItems(originItems: SideMenuItem[], newItems: SideMenuItem[]): void {
    const maxLength = originItems.length > newItems.length ? originItems.length : newItems.length;

    for (let i = 0; i < maxLength; i++) {
      if (i > originItems.length - 1) {
        originItems.push(newItems[i]);
      } else if (i > newItems.length - 1) {
        const originItemsLength = originItems.length;
        for (let j = 0; j < originItemsLength - i; j++) {
          originItems.pop();
        }
        break;
      } else if (!SideMenuComponent.areSameItems(originItems[i], newItems[i])) {
        originItems[i] = newItems[i];
      } else if (!SideMenuComponent.areSameLinks(originItems[i], newItems[i])) {
        originItems[i].links = newItems[i].links;
      }

      // items are same, dont switch
    }
  }

  ngOnInit(): void {
    this.mobileView = window.innerWidth <= AppComponent.minWidth;
    if (this.mobileView) {
      void this.sideNav.close();
    } else {
      void this.sideNav.open();
    }

    this.sideMenuService.facilityItemsChange.subscribe((items) => {
      this.setFacilityItems(items);
    });
    this.sideMenuService.accessItemsChange.subscribe((items) => {
      this.setAccessItems(items);
    });
    this.sideMenuService.adminItemsChange.subscribe((items) => {
      this.setAdminItems(items);
    });
    this.sideMenuService.userItemsChange.subscribe((items) => {
      this.setUserItems(items);
    });
    this.sideMenuService.homeItemsChange.subscribe((items) => {
      this.setHomeItems(items);
    });
    this.sideMenuService.resetChange.subscribe(() => {
      this.reset();
    });
  }

  private reset(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    SideMenuComponent.setNewItems(this.homeItems, []);
    SideMenuComponent.setNewItems(this.adminItems, []);
    SideMenuComponent.setNewItems(this.accessItems, []);
    SideMenuComponent.setNewItems(this.facilityItems, []);
    SideMenuComponent.setNewItems(this.userItems, []);
  }

  private resetExceptHome(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    SideMenuComponent.setNewItems(this.adminItems, []);
    SideMenuComponent.setNewItems(this.accessItems, []);
    SideMenuComponent.setNewItems(this.facilityItems, []);
    SideMenuComponent.setNewItems(this.userItems, []);
  }

  private resetExceptFacility(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    SideMenuComponent.setNewItems(this.homeItems, []);
    SideMenuComponent.setNewItems(this.adminItems, []);
    SideMenuComponent.setNewItems(this.accessItems, []);
    SideMenuComponent.setNewItems(this.userItems, []);
  }

  private resetExceptAccess(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    SideMenuComponent.setNewItems(this.homeItems, []);
    SideMenuComponent.setNewItems(this.adminItems, []);
    SideMenuComponent.setNewItems(this.facilityItems, []);
    SideMenuComponent.setNewItems(this.userItems, []);
  }

  private resetExceptAdmin(): void {
    this.userItemOpened = false;
    SideMenuComponent.setNewItems(this.homeItems, []);
    SideMenuComponent.setNewItems(this.accessItems, []);
    SideMenuComponent.setNewItems(this.facilityItems, []);
    SideMenuComponent.setNewItems(this.userItems, []);
  }

  private resetExceptUser(): void {
    this.adminItemOpened = false;
    SideMenuComponent.setNewItems(this.accessItems, []);
    SideMenuComponent.setNewItems(this.facilityItems, []);
    SideMenuComponent.setNewItems(this.adminItems, []);
  }

  private setHomeItems(items: SideMenuItem[]): void {
    this.resetExceptHome();
    SideMenuComponent.setNewItems(this.homeItems, items);
  }

  private setFacilityItems(items: SideMenuItem[]): void {
    this.resetExceptFacility();
    SideMenuComponent.setNewItems(this.facilityItems, items);
  }

  private setAccessItems(items: SideMenuItem[]): void {
    this.resetExceptAccess();
    SideMenuComponent.setNewItems(this.accessItems, items);
  }

  private setUserItems(items: SideMenuItem[]): void {
    this.userItemOpened = items.length === 0;
    this.resetExceptUser();
    SideMenuComponent.setNewItems(this.userItems, items);
  }

  private setAdminItems(items: SideMenuItem[]): void {
    // hide the main Perun admin menu when some sub menu is opened
    this.adminItemOpened = items.length === 0;
    this.resetExceptAdmin();
    SideMenuComponent.setNewItems(this.adminItems, items);
  }
}

export interface SideMenuItem {
  label: string;
  labelClass?: string;
  colorClass: string;
  activatedClass?: string;
  links: EntityMenuLink[];
  icon: string;
  baseLink?: string[];
  expandable?: boolean;
  baseColorClass?: string;
  baseColorClassRegex?: string;
  linksClass?: string;
  backgroundColorCss?: string;
  textColorCss?: string;
}

export interface EntityMenuLink {
  label: string;
  url: string[] | string;
  activatedRegex: string;
  children?: EntityMenuLink[];
  showChildrenRegex?: string;
}
