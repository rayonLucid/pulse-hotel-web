import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Amenity } from '../models/room.model';


@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  // e.g., environment.apiUrl = 'https://localhost:7001/api'
  private apiUrl = `${environment.apiUrl}/amenities`;

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

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
