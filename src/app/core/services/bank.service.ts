// src/app/core/services/bank.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from './app.config.service';

export interface Bank {
  code: string;
  name: string;
  slug: string;
  ussd: string;
}

export interface AccountValidationResponse {
  success: boolean;
  message: string;
  data?: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BankService {
 // private apiUrl = environment.apiUrl;
private rootUrl = "";
public apiUrl = '';
  constructor(private http: HttpClient,private readonly config:AppConfigService) {
this.apiUrl = `${this.config.apiUrl}`;
this.rootUrl = this.config.rootUrl;
  }
  // Nigerian Banks List
  private nigerianBanks: Bank[] = [
    { code: '044', name: 'Access Bank', slug: 'access-bank', ussd: '*901#' },
    { code: '063', name: 'Access Bank (Diamond)', slug: 'access-bank-diamond', ussd: '*901#' },
    { code: '023', name: 'Citibank Nigeria', slug: 'citibank-nigeria', ussd: '' },
    { code: '050', name: 'Ecobank Nigeria', slug: 'ecobank-nigeria', ussd: '*326#' },
    { code: '070', name: 'Fidelity Bank', slug: 'fidelity-bank', ussd: '*770#' },
    { code: '011', name: 'First Bank of Nigeria', slug: 'first-bank-of-nigeria', ussd: '*894#' },
    { code: '214', name: 'First City Monument Bank', slug: 'first-city-monument-bank', ussd: '*329#' },
    { code: '00103', name: 'Globus Bank', slug: 'globus-bank', ussd: '*989#' },
    { code: '058', name: 'Guaranty Trust Bank', slug: 'guaranty-trust-bank', ussd: '*737#' },
    { code: '030', name: 'Heritage Bank', slug: 'heritage-bank', ussd: '*745#' },
    { code: '301', name: 'Jaiz Bank', slug: 'jaiz-bank', ussd: '*389*301#' },
    { code: '082', name: 'Keystone Bank', slug: 'keystone-bank', ussd: '*711#' },
    { code: '50211', name: 'Kuda Bank', slug: 'kuda-bank', ussd: '' },
    { code: '999992', name: 'OPay Digital Bank', slug: 'opay-digital-bank', ussd: '*955#' },
    { code: '999991', name: 'PalmPay', slug: 'palmpay', ussd: '*652#' },
    { code: '076', name: 'Polaris Bank', slug: 'polaris-bank', ussd: '*833#' },
    { code: '101', name: 'Providus Bank', slug: 'providus-bank', ussd: '' },
    { code: '221', name: 'Stanbic IBTC Bank', slug: 'stanbic-ibtc-bank', ussd: '*909#' },
    { code: '068', name: 'Standard Chartered Bank', slug: 'standard-chartered-bank', ussd: '' },
    { code: '232', name: 'Sterling Bank', slug: 'sterling-bank', ussd: '*822#' },
    { code: '100', name: 'Suntrust Bank', slug: 'suntrust-bank', ussd: '' },
    { code: '102', name: 'Titan Bank', slug: 'titan-bank', ussd: '*922#' },
    { code: '032', name: 'Union Bank of Nigeria', slug: 'union-bank-of-nigeria', ussd: '*826#' },
    { code: '033', name: 'United Bank For Africa', slug: 'united-bank-for-africa', ussd: '*919#' },
    { code: '215', name: 'Unity Bank', slug: 'unity-bank', ussd: '*7799#' },
    { code: '035', name: 'Wema Bank', slug: 'wema-bank', ussd: '*945#' },
    { code: '057', name: 'Zenith Bank', slug: 'zenith-bank', ussd: '*966#' }
];


  // Get all Nigerian banks
  getBanks(): Bank[] {
    return this.nigerianBanks;
  }

  // Get bank by code
  getBankByCode(code: string): Bank | undefined {
    return this.nigerianBanks.find(bank => bank.code === code);
  }

  // Validate account number using PayStack API (Production)
  validateAccountWithPaystack(accountNumber: string, bankCode: string): Observable<AccountValidationResponse> {
    const payload = {
      accountNumber: accountNumber,
      bankCode: bankCode,
      currencies:'NGN'
    };
    console.log(payload)
    return this.http.post<AccountValidationResponse>(`${this.apiUrl}/paystack/validate-account`, payload);
  }

  // Local validation (without API call)
  validateAccountLocally(accountNumber: string, bankCode: string): { valid: boolean; message: string } {
    // Basic validation
    if (!accountNumber || accountNumber.length !== 10) {
      return { valid: false, message: 'Account number must be 10 digits' };
    }

    if (!/^\d+$/.test(accountNumber)) {
      return { valid: false, message: 'Account number must contain only digits' };
    }

    if (!bankCode) {
      return { valid: false, message: 'Please select a bank' };
    }

    // NUBAN (Nigerian Uniform Bank Account Number) algorithm validation
   // const isValidNUBAN = this.validateNUBAN(accountNumber, bankCode);
  const checkAccNumber = this. calculateNubanCheckDigit(accountNumber);
//console.log(`NUBAN validation for account ${accountNumber} and bank code ${bankCode}: ${isValidNUBAN}`);
    if (!checkAccNumber) {
      return { valid: false, message: 'Invalid account number format' };
    }

    return { valid: true, message: 'Account number format is valid' };
  }

  // NUBAN Algorithm Validation
  private validateNUBAN(accountNumber: string, bankCode: string): boolean {
    // NUBAN validation algorithm
    //const nubanWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3];
    const nubanWeights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];

    const nationalBankCode = '000000';
    const cipher = `${bankCode}${nationalBankCode}${accountNumber}`;

    let total = 0;
    for (let i = 0; i < cipher.length; i++) {
      total += parseInt(cipher[i]) * nubanWeights[i % nubanWeights.length];
    }

    const checkDigit = total % 10;
    return checkDigit === 0;
  }

  private calculateNubanCheckDigit(accountNumber:string) {
  const weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];

  // Convert to 15-digit string (padded with leading zeros if needed)
  const digits = accountNumber.toString().padStart(15, "0").split("").map(Number);

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += digits[i] * weights[i];
  }

  // Calculate modulo 10
  const remainder = sum % 10;

  // Calculate check digit
  return remainder === 0 ? 0 : 10 - remainder;
}


  // Format account number for display
  formatAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '';
    // Format as XXXX XXXX XX
    return accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
  }

  // Mask account number for security
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 10) return accountNumber;
    return `XXXX XXXX ${accountNumber.slice(-4)}`;
  }
}
