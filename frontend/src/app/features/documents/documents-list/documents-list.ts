import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

import { DocumentsService } from '../../../core/services/documents';
import { ToastService } from '../../../core/services/toast.service';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-documents-list',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.css',
})
export class DocumentsList implements OnInit {
  documents: any[] = [];
  filteredDocuments: any[] = [];
  searchQuery: string = '';
  activeFilter: string = '';

  constructor(
    private documentsService: DocumentsService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentsService.getDocuments().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.documents = data;
          this.filteredDocuments = [...data];
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки документов', err)
    });
  }

  get stats() {
    return {
      total: this.documents.length,
      pdf: this.documents.filter(d => d.file_type === 'PDF').length,
      docx: this.documents.filter(d => d.file_type === 'DOCX').length,
    };
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter(type: string) {
    this.activeFilter = type;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.documents;

    if (this.activeFilter) {
      result = result.filter(d => d.file_type === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      result = result.filter(d =>
        d.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredDocuments = result;
  }

  goToUpload() {
    this.router.navigate(['/documents/upload']);
  }

  onDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Вы уверены что хотите удалить этот документ?',
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.documentsService.deleteDocument(id).subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.documents = this.documents.filter(d => d.id !== id);
              this.filteredDocuments = this.filteredDocuments.filter(d => d.id !== id);
              this.cdr.markForCheck();
              this.toastService.success('Документ успешно удалён');
            });
          },
          error: (err) => {
            this.toastService.error('Ошибка удаления документа');
            console.error(err);
          }
        });
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  getFileIcon(type: string): string {
    return type === 'DOCX' ? '📝' : '📄';
  }
}