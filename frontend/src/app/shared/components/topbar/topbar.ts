import { Component, OnInit, output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-topbar',
  imports: [
    ButtonModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  user: any = null;

  constructor(private authService: AuthService) { }

  menuClick = output();

  onMenuClick() {
    this.menuClick.emit();
  }

  ngOnInit() {
    this.user = this.authService.getUser();
  }

}
