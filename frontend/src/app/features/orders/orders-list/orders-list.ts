import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';
import { Orders } from '../../../core/services/orders';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-orders-list',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.css',
})
export class OrdersList implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  searchQuery: string = '';
  activeFilter: string = '';
  loading: boolean = false;

  constructor(
    private ordersService: Orders,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.orders = data;
          this.filteredOrders = [...data];
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Ошибка загрузки заказов', err);
      }
    });
  }

  get stats() {
    return {
      total: this.orders.length,
      new: this.orders.filter(o => o.status === 'new').length,
      inProgress: this.orders.filter(o => o.status === 'in_progress').length,
      done: this.orders.filter(o => o.status === 'done').length,
    };
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter(status: string) {
    this.activeFilter = status;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.orders;

    if (this.activeFilter) {
      result = result.filter(o => o.status === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      result = result.filter(o =>
        o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredOrders = result;
  }

  openOrder(id: number) {
    this.router.navigate(['/orders', id]);
  }

  goToNewOrder() {
    this.router.navigate(['/orders/new']);
  }

  onDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Вы уверены что хотите удалить этот заказ?',
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ordersService.deleteOrder(id).subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.orders = this.orders.filter(o => o.id !== id);
              this.filteredOrders = this.filteredOrders.filter(o => o.id !== id);
              this.cdr.markForCheck();
              this.toastService.success('Заказ успешно удалён');
            });
          },
          error: (err) => console.error('Ошибка удаления', err)
        });
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      new: 'Новый',
      in_progress: 'В работе',
      done: 'Завершён'
    };
    return labels[status] || status;
  }
}