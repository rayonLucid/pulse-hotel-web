// device-info.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class DeviceInfoInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const userAgent = navigator.userAgent;
    const deviceType = this.detectDeviceType(userAgent);

    const modifiedReq = req.clone({
      setHeaders: {
        'User-Agent': userAgent,
        'X-Device-Type': deviceType
      }
    });
    return next.handle(modifiedReq);
  }

  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
    return 'Desktop';
  }
}
