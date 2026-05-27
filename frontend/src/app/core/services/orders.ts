import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getStats() {
    return this.http.get<any>(`${this.apiUrl}/home/stats`);
  }

  getOrders(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<any[]>(`${this.apiUrl}/orders`, { params });
  }

  getOrderById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string, changed_by: number) {
    return this.http.patch<any>(`${this.apiUrl}/orders/${id}/status`, { status, changed_by });
  }

  createOrder(data: any) {
    return this.http.post<any>(`${this.apiUrl}/orders`, data);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }

  deleteOrder(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/orders/${id}`);
  }
}