import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getDocuments() {
    return this.http.get<any[]>(`${this.apiUrl}/documents`);
  }

  deleteDocument(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/documents/${id}`);
  }

  uploadDocument(formData: FormData) {
    return this.http.post<any>(`${this.apiUrl}/documents`, formData);
  }
}