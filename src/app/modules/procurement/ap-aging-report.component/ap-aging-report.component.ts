import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { APAgingItem } from '../../../core/models/procurement';
import { ProcurementService } from '../../../core/services/procurement.service';


@Component({
  selector: 'app-ap-aging-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ap-aging-report.component.html',
  styleUrls: ['./ap-aging-report.component.scss']
})
export class APAgingReportComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  agingData: APAgingItem[] = [];
  loading = false;
  asOfDate: string = new Date().toISOString().split('T')[0];
cdr = inject(ChangeDetectorRef)
  ngOnInit() { this.loadReport(); }
  loadReport() {
    this.loading = true;
    this.procurementService.getAPAgingReport(this.asOfDate).subscribe({
      next: (data) => { this.agingData = data; this.loading = false; this.cdr.detectChanges()},
      error: (err) => { console.error(err);
        this.loading = false;
         this.cdr.detectChanges()}
    });
  }
}
