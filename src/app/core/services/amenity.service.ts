import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Amenity } from '../models/room.model';
import { AppConfigService } from './app.config.service';


@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  // e.g., environment.apiUrl = 'https://localhost:7001/api'


  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
public apiUrl = '';
  constructor(private http: HttpClient,private readonly config: AppConfigService) {
this.apiUrl = `${this.config.apiUrl}/amenities`;
  }

  // 1. GET ALL
  getAmenities(): Observable<Amenity[]> {
    return this.http.get<Amenity[]>(this.apiUrl);
  }

  // 2. GET BY ID
  getAmenityById(id: number): Observable<Amenity> {
    return this.http.get<Amenity>(`${this.apiUrl}/${id}`);
  }

  // 3. CREATE (POST)
  createAmenity(amenity: Amenity): Observable<Amenity> {
    return this.http.post<Amenity>(this.apiUrl, amenity, this.httpOptions);
  }

  // 4. UPDATE (PUT)
  updateAmenity(id: number, amenity: Amenity): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, amenity, this.httpOptions);
  }

  // 5. DELETE
  deleteAmenity(id: number): Observable<void> {
    return this.http.delete<void>(`${`${this.apiUrl}/${id}`}`);
  }
}
