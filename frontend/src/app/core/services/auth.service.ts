import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(email: string, password: string) {
        return this.http.post<{ token: string; user: any }>(
            `${this.apiUrl}/login`,
            { email, password }
        );
    }

    saveToken(token: string, user: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    getUser(): any {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn(): boolean {
        if (typeof window === 'undefined') return false;
        return !!this.getToken();
    }


    logout() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }
}