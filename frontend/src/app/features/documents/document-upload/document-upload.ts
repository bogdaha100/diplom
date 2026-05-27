import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

import { DocumentsService } from '../../../core/services/documents';
import { Orders } from '../../../core/services/orders';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-document-upload',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css',
})
export class DocumentUpload implements OnInit {
  title: string = '';
  order_id: number | null = null;
  selectedFile: File | null = null;
  orders: any[] = [];
  user: any = null;
  titleError: string = '';
  orderError: string = '';
  fileError: string = '';
  isDragging: boolean = false;

  constructor(
    private router: Router,
    private documentsService: DocumentsService,
    private ordersService: Orders,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.orders = data;
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки заказов', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = '';
    }
  }

  validate(): boolean {
    this.titleError = '';
    this.orderError = '';
    this.fileError = '';
    let valid = true;

    if (!this.title.trim()) {
      this.titleError = 'Наименование обязательно';
      valid = false;
    }
    if (!this.order_id) {
      this.orderError = 'Выберите заказ';
      valid = false;
    }
    if (!this.selectedFile) {
      this.fileError = 'Выберите файл';
      valid = false;
    }
    return valid;
  }

  onSubmit() {
    if (!this.validate()) return;

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('order_id', String(this.order_id));
    formData.append('uploaded_by', String(this.user.id));
    formData.append('file', this.selectedFile!);

    this.documentsService.uploadDocument(formData).subscribe({
      next: () => {
        this.toastService.success('Документ успешно загружен');
        this.router.navigate(['/documents']);
      },
      error: (err) => {
        this.toastService.error('Ошибка загрузки документа');
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/documents']);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = '';
    }
  }
}