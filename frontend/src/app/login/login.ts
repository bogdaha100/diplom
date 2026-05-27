import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  inputEmail: string = '';
  inputPassword: string = '';
  emailError: string = '';
  passwordError: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // loginForm = FormBuilder  

  validateEmail() {
    this.emailError = '';

    if (!this.inputEmail) {
      this.emailError = 'Введите email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inputEmail)) {
      this.emailError = 'Введите корректный email';
    }
  }

  validatePassword() {
    this.passwordError = '';

    if (!this.inputPassword) {
      this.passwordError = 'Введите пароль';
      return;
    }

    if (this.inputPassword.length < 8) {
      this.passwordError = 'Пароль минимум 8 символов';
    }
  }

  onLogin() {
    this.validateEmail();
    this.validatePassword();

    if (this.emailError || this.passwordError) {
      return;
    }

    this.isLoading = true;

    this.authService.login(this.inputEmail, this.inputPassword).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token, response.user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.emailError = 'Неверный email или пароль';
        } else {
          this.emailError = 'Ошибка сервера, попробуйте позже';
        }
      }
    });
  }
}
