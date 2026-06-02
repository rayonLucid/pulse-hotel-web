import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveService } from '../../../../core/services/leave.service';


@Component({
  selector: 'app-leave-request-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-request-modal.component.html',
  styleUrls: ['./leave-request-modal.component.scss']
})
export class LeaveRequestModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();
  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);

  leaveForm!: FormGroup;

  ngOnInit() {
    this.leaveForm = this.fb.group({
      // This should be set to the current user's ID in a real app
      leaveType: ['Annual', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['']
    });
  }

  submit() {
    if (this.leaveForm.valid) {
      this.leaveService.submitLeaveRequest(this.leaveForm.value).subscribe({
        next: () => this.closeModal.emit(true),
        error: (err) => console.error(err)
      });
    }
  }

  close() {
    this.closeModal.emit(false);
  }
}
