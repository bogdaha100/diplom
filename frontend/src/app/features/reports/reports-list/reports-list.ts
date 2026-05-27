import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports-list',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
    DatePickerModule,
  ],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.css',
})
export class ReportsList implements OnInit {
  allOrders: any[] = [];
  filteredOrders: any[] = [];
  assigneeList: { name: string; count: number }[] = [];
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.http.get<any>('http://localhost:3000/api/reports').subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.allOrders = data.orders;
          this.filteredOrders = [...data.orders];
          this.buildAssigneeStats(data.orders);
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки отчётов', err)
    });
  }

  buildAssigneeStats(orders: any[]) {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const name = o.assignee?.full_name ?? 'Не назначен';
      map[name] = (map[name] || 0) + 1;
    });
    this.assigneeList = Object.entries(map).map(([name, count]) => ({ name, count }));
  }

  get stats() {
    return {
      total: this.filteredOrders.length,
      inProgress: this.filteredOrders.filter(o => o.status === 'in_progress').length,
      done: this.filteredOrders.filter(o => o.status === 'done').length,
      new: this.filteredOrders.filter(o => o.status === 'new').length,
    };
  }

  applyFilter() {
    let result = this.allOrders;

    if (this.dateFrom) {
      result = result.filter(o => new Date(o.created_at) >= this.dateFrom!);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59);
      result = result.filter(o => new Date(o.created_at) <= to);
    }

    this.filteredOrders = result;
    this.buildAssigneeStats(result);
    this.cdr.markForCheck();
  }

  resetFilter() {
    this.dateFrom = null;
    this.dateTo = null;
    this.filteredOrders = [...this.allOrders];
    this.buildAssigneeStats(this.allOrders);
    this.cdr.markForCheck();
  }

  getProgressWidth(count: number): number {
    if (!this.filteredOrders.length) return 0;
    return (count / this.filteredOrders.length) * 100;
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  getStatusLabel(status: string): string {
    const labels: any = { new: 'Новый', in_progress: 'В работе', done: 'Завершён' };
    return labels[status] || status;
  }

  exportToExcel() {
    const data = this.filteredOrders.map(o => ({
      'Наименование': o.title,
      'Статус': this.getStatusLabel(o.status),
      'Исполнитель': o.assignee?.full_name ?? 'Не назначен',
      'Дата создания': this.formatDate(o.created_at),
      'Дедлайн': this.formatDate(o.deadline),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заказы');

    const dateStr = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Отчёт_заказы_${dateStr}.xlsx`);
  }
}