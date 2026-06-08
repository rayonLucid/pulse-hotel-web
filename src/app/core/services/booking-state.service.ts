// src/app/modules/guest/services/booking-state.service.ts
import { Injectable } from '@angular/core';

export interface BookingDraft {
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
  selectedRoomId?: number;
}

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private draft: BookingDraft | null = null;

  saveDraft(draft: BookingDraft) {
    this.draft = draft;
  }

  getDraft(): BookingDraft | null {
    return this.draft;
  }

  clearDraft() {
    this.draft = null;
  }
}
