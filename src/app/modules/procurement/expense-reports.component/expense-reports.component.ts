// src/app/modules/procurement/expense-reports/expense-reports.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ToastrService } from 'ngx-toastr';


interface ExpenseReportItem {
  period: string;
  totalExpenses: number;
}

@Component({
  selector: 'app-expense-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-reports.component.html',
  styleUrls: ['./expense-reports.component.scss']
})
export class ExpenseReportsComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  reportData: ExpenseReportItem[] = [];
  loading = false;
  toastService = inject(ToastrService)
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadReport(); }

  loadReport() {
    this.loading = true;
    // Assuming a method getExpenseReport exists; if not, you'll need to add it.
    this.procurementService.getExpenseReport(this.startDate, this.endDate).subscribe({
      next: (data) => { this.reportData = data;
        this.loading = false;
        this.cdr.detectChanges() },
      error: (err) => { console.error(err);
        this.toastService.error(err)
        this.loading = false; this.cdr.detectChanges()}
    });
  }
}
