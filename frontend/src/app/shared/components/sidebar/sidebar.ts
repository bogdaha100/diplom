import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    DrawerModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  visible: boolean = false;

  constructor(private authService: AuthService) { }

  open() {
    this.visible = true;
  }

  onLogout() {
    this.authService.logout();
  }

  get isAdmin(): boolean {
    const user = this.authService.getUser();
    return user?.role === 'Администратор';
  }
}