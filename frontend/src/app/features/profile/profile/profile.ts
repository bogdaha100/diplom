import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';


import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any = null;
  fullName: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  successMessage: string = '';

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.http.get<any>(`${this.apiUrl}/admin/profile/${currentUser.id}`).subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            this.user = data;
            this.fullName = data.full_name;
            this.cdr.markForCheck();
          });
        },
        error: (err) => console.error('Ошибка загрузки профиля', err)
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getRoleBadgeClass(roleName: string): string {
    if (roleName === 'Администратор') return 'b-admin';
    if (roleName === 'Менеджер') return 'b-manager';
    return 'b-employee';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  onSave() {
    this.passwordError = '';
    this.successMessage = '';

    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Пароли не совпадают';
      return;
    }

    if (this.newPassword && this.newPassword.length < 6) {
      this.passwordError = 'Пароль минимум 6 символов';
      return;
    }

    const data: any = { full_name: this.fullName };
    if (this.newPassword) data.password = this.newPassword;

    this.http.patch<any>(`${this.apiUrl}/admin/profile/${this.user.id}`, data).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.user = updated;
          this.authService.saveToken(this.authService.getToken()!, updated);
          this.newPassword = '';
          this.confirmPassword = '';
          this.toastService.success('Профиль успешно обновлён');
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.toastService.error('Ошибка обновления профиля');
        console.error(err);
      }
    });
  }

  onCancel() {
    if (this.user) this.fullName = this.user.full_name;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.successMessage = '';
  }
}