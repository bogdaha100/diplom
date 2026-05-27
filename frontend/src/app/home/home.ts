import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../shared/components/sidebar/sidebar';
import { Topbar } from '../shared/components/topbar/topbar';
import { AuthService } from '../core/services/auth.service';
import { Orders } from '../core/services/orders';

@Component({
  selector: 'app-home',
  imports: [
    Sidebar,
    Topbar,
    RouterLink,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  user: any = null;
  stats: any = null;
  latestOrders: any[] = [];
  latestDocuments: any[] = [];

  constructor(
    private authService: AuthService,
    private ordersService: Orders,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadStats();
  }

  loadStats() {
    this.ordersService.getStats().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.stats = data.stats;
          this.latestOrders = [...data.latestOrders];
          this.latestDocuments = [...data.latestDocuments];
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Ошибка загрузки статистики', err);
      }
    });
  }
}