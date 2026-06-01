import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../../../core/services/app.config.service';

Chart.register(...registerables);

@Component({
  selector: 'app-expense-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-charts.component.html',
  styleUrls: ['./expense-charts.component.scss']
})
export class ExpenseChartsComponent implements OnInit {
  @ViewChild('monthlyChart') chartCanvas!: ElementRef;
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private apiUrl = `${this.config.apiUrl}/procurement`;

  ngOnInit() { this.fetchData(); }
  fetchData() {
    this.http.get<any[]>(`${this.apiUrl}/reports/monthly-expenses`).subscribe(data => {
      new Chart(this.chartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map(d => d.month),
          datasets: [{
            label: 'Monthly Expenses',
            data: data.map(d => d.total),
            backgroundColor: '#4f46e5',
            borderColor: '#4338ca',
            borderWidth: 1
          }]
        },
        options: { responsive: true, maintainAspectRatio: true }
      });
    });
  }
}
