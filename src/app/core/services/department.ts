// department.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Department } from '../models/ department.model';
import { AppConfigService } from './app.config.service';
import { Staff } from '../models/staff.model';
import { MenuDepartmentPermission, MenuItem } from '../models/menu.model';


@Injectable({ providedIn: 'root' })
export class DepartmentService {
  // private http = inject(HttpClient);
  // private apiUrl = '/api/departments';

  private rootUrl = "";
  public apiUrl = '';
    constructor(private http: HttpClient,private readonly config:AppConfigService) {
  this.apiUrl = `${this.config.apiUrl}/departments`;
  this.rootUrl = this.config.rootUrl;
    }

// department.service.ts


getDepartmentPermissions(departmentId: number): Observable<MenuDepartmentPermission[]> {
  return this.http.get<MenuDepartmentPermission[]>(`${this.apiUrl}/${departmentId}/permissions`);
}

saveDepartmentPermissions(departmentId: number, permissions: any[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/${departmentId}/permissions`, permissions);
}


  getDepartments(activeOnly?: boolean): Observable<Department[]> {
    const params = activeOnly ? '?isActive=true' : '';
    return this.http.get<Department[]>(`${this.apiUrl}${params}`);
  }
 getManagingStaff(): Observable<{ success: boolean; data: Staff[] }> {
   return this.http.get<{ success: boolean; data: Staff[] }>(`${this.apiUrl}/managing-staff`)
   .pipe(catchError(() => of({ success: false, data: [] })));
  }


  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  createDepartment(data: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, data);
  }

  updateDepartment(id: number, data: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, data);
  }

  deleteDepartment(id: number, hardDelete = false): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}?hardDelete=${hardDelete}`);
  }
}
