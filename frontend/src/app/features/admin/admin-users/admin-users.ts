import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

import { ToastService } from '../../../core/services/toast.service';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-users',
  imports: [
    Sidebar,
    Topbar,
    FormsModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  roles: any[] = [];
  searchQuery: string = '';

  showAddDialog: boolean = false;
  showEditDialog: boolean = false;

  newUser = { full_name: '', email: '', password: '', role_id: null as any };
  editUser: any = null;

  nameError: string = '';
  emailError: string = '';
  passwordError: string = '';

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/admin/users`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.users = data;
          this.filteredUsers = [...data];
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки пользователей', err)
    });
  }

  loadRoles() {
    this.http.get<any[]>(`${this.apiUrl}/admin/roles`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.roles = data;
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Ошибка загрузки ролей', err)
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getRoleBadgeClass(roleName: string): string {
    if (roleName === 'Администратор') return 'b-admin';
    if (roleName === 'Менеджер') return 'b-manager';
    return 'b-employee';
  }

  getUserCountByRole(roleName: string): number {
    return this.users.filter(u => u.role?.name === roleName).length;
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  openAddDialog() {
    this.newUser = { full_name: '', email: '', password: '', role_id: null };
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.showAddDialog = true;
  }

  onAddUser() {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';

    if (!this.newUser.full_name.trim()) { this.nameError = 'Введите имя'; return; }
    if (!this.newUser.email.trim()) { this.emailError = 'Введите email'; return; }
    if (!this.newUser.password.trim()) { this.passwordError = 'Введите пароль'; return; }

    this.http.post<any>(`${this.apiUrl}/admin/users`, this.newUser).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loadUsers();
          this.showAddDialog = false;
          this.toastService.success('Пользователь успешно создан');
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.emailError = err.error?.message || 'Ошибка создания';
        this.toastService.error('Ошибка создания пользователя');
      }
    });
  }

  openEditDialog(user: any) {
    this.editUser = { ...user, role_id: user.role_id };
    this.showEditDialog = true;
  }

  onEditUser() {
    if (!this.editUser) return;

    this.http.patch<any>(`${this.apiUrl}/admin/users/${this.editUser.id}`, {
      full_name: this.editUser.full_name,
      role_id: this.editUser.role_id
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loadUsers();
          this.showEditDialog = false;
          this.toastService.success('Пользователь успешно обновлён');
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.toastService.error('Ошибка обновления пользователя');
        console.error(err);
      }
    });
  }

  onDeleteUser(id: number) {
    this.confirmationService.confirm({
      message: 'Вы уверены что хотите удалить этого пользователя?',
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.http.delete(`${this.apiUrl}/admin/users/${id}`).subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.users = this.users.filter(u => u.id !== id);
              this.filteredUsers = this.filteredUsers.filter(u => u.id !== id);
              this.toastService.success('Пользователь успешно удалён');
              this.cdr.markForCheck();
            });
          },
          error: (err) => {
            this.toastService.error('Ошибка удаления пользователя');
            console.error(err);
          }
        });
      }
    });
  }
}