// services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/roles.model';
import { AppConfigService } from './app.config.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
 // private apiUrl = '/api/roles';


   private rootUrl = "";
    public apiUrl = '';
      constructor(private readonly config:AppConfigService, private http: HttpClient) {

    this.apiUrl = `${this.config.apiUrl}/roles`;
     // console.log('NotificationService initialized with API URL:', this.apiUrl);
    this.rootUrl = this.config.rootUrl;
   
      }

  getAll(): Observable<{ success: boolean; data: Role[] }> {
    return this.http.get<{ success: boolean; data: Role[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ success: boolean; data: Role }> {
    return this.http.get<{ success: boolean; data: Role }>(`${this.apiUrl}/${id}`);
  }

  create(role: Partial<Role>): Observable<{ success: boolean; data: Role }> {
    return this.http.post<{ success: boolean; data: Role }>(this.apiUrl, role);
  }

  update(id: number, role: Partial<Role>): Observable<{ success: boolean; data: Role }> {
    return this.http.put<{ success: boolean; data: Role }>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
