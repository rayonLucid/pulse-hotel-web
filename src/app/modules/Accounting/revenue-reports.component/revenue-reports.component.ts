import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService, RevenueReportItem } from '../../../core/services/accounting.service';


@Component({
  selector: 'app-revenue-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue-reports.component.html',
  styleUrls: ['./revenue-reports.component.scss']
})
export class RevenueReportsComponent implements OnInit {
  private accountingService = inject(AccountingService);
  reportData: RevenueReportItem[] = [];
  loading = false;
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadReport(); }

  loadReport() {
    this.loading = true;
    this.accountingService.getRevenueReport(this.startDate, this.endDate).subscribe({
      next: (data) => { this.reportData = data; this.loading = false; this.cdr.detectChanges()},
      error: (err) => { console.error(err); this.loading = false;  this.cdr.detectChanges()}
    });
  }
}
