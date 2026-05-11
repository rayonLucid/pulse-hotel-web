// src/app/modules/housekeeping/housekeeping.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-housekeeping',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Housekeeping Management</h1>
        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600">Housekeeping module coming soon...</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HousekeepingComponent {
  constructor() {}
}
