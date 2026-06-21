import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

import { Orders } from '../../../core/services/orders';
import { DocumentsService } from '../../../core/services/documents';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-order-detail',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  order: any = null;
  selectedStatus: string = '';
  user: any = null;
  uploading: boolean = false;

  statuses = [
    { label: 'Новый', value: 'new' },
    { label: 'В работе', value: 'in_progress' },
    { label: 'Завершён', value: 'done' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: Orders,
    private documentsService: DocumentsService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder(id);
  }

  loadOrder(id: number) {
    this.ordersService.getOrderById(id).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.order = data;
          this.selectedStatus = data.status;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Ошибка загрузки заказа', err);
      }
    });
  }

  onStatusChange() {
    if (!this.order || !this.user) return;
    this.ordersService.updateOrderStatus(
      this.order.id,
      this.selectedStatus,
      this.user.id
    ).subscribe({
      next: () => {
        this.toastService.success('Статус заказа обновлён');
        this.loadOrder(this.order.id);
      },
      error: (err) => {
        this.toastService.error('Ошибка обновления статуса');
        console.error(err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
    event.target.value = '';
  }

  uploadFile(file: File) {
    if (!this.order || !this.user) return;

    this.uploading = true;

    const formData = new FormData();
    formData.append('title', file.name);
    formData.append('order_id', String(this.order.id));
    formData.append('uploaded_by', String(this.user.id));
    formData.append('file', file);

    this.documentsService.uploadDocument(formData).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.uploading = false;
          this.toastService.success('Документ успешно загружен');
          this.loadOrder(this.order.id);
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.uploading = false;
          this.toastService.error('Ошибка загрузки документа');
          this.cdr.markForCheck();
        });
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
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