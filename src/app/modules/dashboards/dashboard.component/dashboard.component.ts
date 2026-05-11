// src/app/modules/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-gray-500 text-sm">Total Rooms</h3>
            <p class="text-3xl font-bold text-primary-600">250</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-gray-500 text-sm">Occupancy Rate</h3>
            <p class="text-3xl font-bold text-primary-600">78%</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-gray-500 text-sm">Today's Check-ins</h3>
            <p class="text-3xl font-bold text-primary-600">45</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-gray-500 text-sm">Revenue (Month)</h3>
            <p class="text-3xl font-bold text-primary-600">₦18.5M</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  constructor() {}
}
