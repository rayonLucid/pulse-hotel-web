// app.config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  rootUrl: string;
  payStackPublicKey: string;
  appName: string;
  appVersion: string;
  tokenKey: string;
  userKey: string;

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
 public AppConfig!: AppConfig;

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    try {

       this.AppConfig = await firstValueFrom(
      this.http.get<AppConfig>('config.json')
    );

     // console.log(this.AppConfig.apiUrl);

    } catch (err) {
      console.error(err);
    }
  }

  get apiUrl(): string {

    return this.AppConfig?.apiUrl ;
  }

  get rootUrl(): string {
    return this.AppConfig?.rootUrl || '';
  }
  // get payStackPublicKey(): string {
  //   return this.config?.payStackPublicKey || 'sk_test_033ec7c1ab250c4e3c5f08af316791cec9d022b';
  // }
  // ... other getters as needed
}
