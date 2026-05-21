// app.config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  rootUrl: string;
  appName: string;
  appVersion: string;
  tokenKey: string;
  userKey: string;
  payStackPublicKey: string;
  googleMapsApiKey: string;
  enableDebug: boolean;
  sessionTimeout: number;
  pageSize: number;
  pageSizeOptions: number[];
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  config!: AppConfig;

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/api/config')
      );
    } catch (err) {
      console.error('Failed to load runtime config, using defaults');
    }
  }

  get apiUrl(): string {
    return this.config?.apiUrl || 'https://pulsehotelx.precleminternationalschool.com.ng/api';
  }

  get rootUrl(): string {
    return this.config?.rootUrl || 'https://pulsehotelx.precleminternationalschool.com.ng/';
  }

  // ... other getters as needed
}
