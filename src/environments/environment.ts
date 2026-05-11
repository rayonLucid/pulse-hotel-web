// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44384/api',
  appName: 'Pulse Hotel',
  appVersion: '1.0.0',
  tokenKey: 'access_token',
  userKey: 'user_data',
  paystackPublicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  googleMapsApiKey: '',
  enableDebug: true,
  sessionTimeout: 3600, // seconds
  pagination: {
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  currency: 'NGN',
  currencySymbol: '₦'
};
