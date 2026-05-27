import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';
import { Orders } from '../../../core/services/orders';
import { AuthService } from '../../../core/services/auth.service';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-order-new',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    DatePickerModule,
    SelectModule,
  ],
  templateUrl: './order-new.html',
  styleUrl: './order-new.css',
})
export class OrderNew implements OnInit {
  title: string = '';
  description: string = '';
  assigned_to: number | null = null;
  deadline: Date | null = null;
  titleError: string = '';
  users: any[] = [];
  user: any = null;

  constructor(
    private router: Router,
    private ordersService: Orders,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadUsers();
  }

  loadUsers() {
    this.ordersService.getUsers().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.users = data;
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки пользователей', err)
    });
  }

  validate(): boolean {
    this.titleError = '';
    if (!this.title.trim()) {
      this.titleError = 'Наименование обязательно';
      return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.validate()) return;

    const data = {
      title: this.title,
      description: this.description,
      assigned_to: this.assigned_to || null,
      deadline: this.deadline ? this.deadline.toISOString() : null,
      created_by: this.user.id,
    };

    this.ordersService.createOrder(data).subscribe({
      next: (order) => {
        this.toastService.success('Заказ успешно создан');
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => console.error('Ошибка создания заказа', err)
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}