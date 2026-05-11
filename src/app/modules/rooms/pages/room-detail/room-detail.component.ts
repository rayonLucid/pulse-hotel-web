// src/app/modules/rooms/pages/room-detail/room-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../../../core/services/room.service';
import { Room, RoomStatusType, BedType, ViewType, getRoomStatusLabel, getBedTypeLabel, getViewTypeLabel, formatPrice } from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  room: Room | null = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  showDeleteModal = false;
  showStatusModal = false;
  newStatus: RoomStatusType | null = null;
  statusNotes = '';

  roomForm: FormGroup;

  // Available options
  statusOptions: { value: RoomStatusType; label: string }[] = [
    { value: 'Available', label: 'Available' },
    { value: 'Occupied', label: 'Occupied' },
    { value: 'Maintenance', label: 'Under Maintenance' },
    { value: 'Cleaning', label: 'Being Cleaned' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'OutOfService', label: 'Out of Service' }
  ];

  bedTypeOptions: { value: BedType; label: string }[] = [
    { value: 'Single', label: 'Single Bed' },
    { value: 'Double', label: 'Double Bed' },
    { value: 'Queen', label: 'Queen Size Bed' },
    { value: 'King', label: 'King Size Bed' },
    { value: 'Emperor', label: 'Emperor Size Bed' },
    { value: 'Twin', label: 'Twin Beds' },
    { value: 'Sofa Bed', label: 'Sofa Bed' }
  ];

  viewTypeOptions: { value: ViewType; label: string }[] = [
    { value: 'City View', label: 'City View' },
    { value: 'Ocean View', label: 'Ocean View' },
    { value: 'Pool View', label: 'Pool View' },
    { value: 'Garden View', label: 'Garden View' },
    { value: 'Mountain View', label: 'Mountain View' },
    { value: 'Lagoon View', label: 'Lagoon View' },
    { value: 'Panoramic', label: 'Panoramic View' },
    { value: 'No View', label: 'No View' }
  ];

  amenityOptions: string[] = [
    'Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar',
    'Room Service', 'Coffee/Tea Maker', 'Safe Deposit Box', 'Work Desk',
    'Ironing Facilities', 'Hair Dryer', 'Bathrobe', 'Slippers',
    'Bath Tub', 'Separate Shower', 'Balcony', 'Ocean View'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private toastr: ToastrService
  ) {
    this.roomForm = this.fb.group({
      roomNumber: ['', [Validators.required]],
      roomTypeId: ['', [Validators.required]],
      floorNumber: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      pricePerNight: ['', [Validators.required, Validators.min(0)]],
      maxAdults: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      maxChildren: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      roomSize: ['', [Validators.required, Validators.min(10)]],
      bedType: ['', [Validators.required]],
      viewType: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRoom(parseInt(id));
    } else {
      this.router.navigate(['/rooms']);
    }
  }

  loadRoom(id: number): void {
    this.isLoading = true;
    this.roomService.getRoomById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.room = response.data;
          this.populateForm();
          this.isLoading = false;
        } else {
          this.toastr.error('Room not found', 'Error');
          this.router.navigate(['/rooms']);
        }
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.toastr.error('Failed to load room details', 'Error');
        this.isLoading = false;
        this.router.navigate(['/rooms']);
      }
    });
  }

  populateForm(): void {
    if (!this.room) return;

    this.roomForm.patchValue({
      roomNumber: this.room.roomNumber,
      roomTypeId: this.room.roomTypeId,
      floorNumber: this.room.floorNumber,
      pricePerNight: this.room.pricePerNight,
      maxAdults: this.room.maxAdults,
      maxChildren: this.room.maxChildren,
      roomSize: this.room.roomSize,
      bedType: this.room.bedType,
      viewType: this.room.viewType,
      description: this.room.description || '',
      amenities: this.room.amenities || []
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.populateForm(); // Reset form on cancel
    }
  }

  saveRoom(): void {
    if (this.roomForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const updatedRoom = {
      ...this.roomForm.value,
      roomId: this.room?.roomId
    };

    this.roomService.updateRoom(this.room!.roomId, updatedRoom).subscribe({
      next: (response:any) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Room updated successfully', 'Success');
          this.isEditing = false;
          this.loadRoom(this.room!.roomId);
        } else {
          this.toastr.error(response.message || 'Update failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to update room', 'Error');
      }
    });
  }

  openStatusModal(): void {
    this.newStatus = null;
    this.statusNotes = '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.newStatus = null;
    this.statusNotes = '';
  }

  updateStatus(): void {
    if (!this.newStatus) {
      this.toastr.warning('Please select a status', 'Warning');
      return;
    }

    this.isSaving = true;
    this.roomService.updateRoomStatus(this.room!.roomId, this.newStatus, this.statusNotes).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success(`Room status updated to ${getRoomStatusLabel(this.newStatus!)}`, 'Success');
          this.closeStatusModal();
          this.loadRoom(this.room!.roomId);
        } else {
          this.toastr.error(response.message || 'Update failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to update status', 'Error');
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    this.isSaving = true;
    this.roomService.deleteRoom(this.room!.roomId).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Room deleted successfully', 'Success');
          this.router.navigate(['/rooms']);
        } else {
          this.toastr.error(response.message || 'Delete failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to delete room', 'Error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'status-available',
      'Occupied': 'status-occupied',
      'Maintenance': 'status-maintenance',
      'Cleaning': 'status-cleaning',
      'Reserved': 'status-reserved',
      'OutOfService': 'status-outofservice'
    };
    return classes[status] || 'status-available';
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.roomForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.roomForm.get('amenities')?.value || [];
    if (amenities.includes(amenity)) {
      this.roomForm.patchValue({ amenities: amenities.filter((a: string) => a !== amenity) });
    } else {
      this.roomForm.patchValue({ amenities: [...amenities, amenity] });
    }
  }

  getBedTypeLabel(bedType: BedType): string {
  return getBedTypeLabel(bedType);
}

/**
 * Get view type label from enum
 */
getViewTypeLabel(viewType: ViewType): string {
  return getViewTypeLabel(viewType);
}

/**
 * Get room status label
 */
getRoomStatusLabel(status: RoomStatusType): string {
  return getRoomStatusLabel(status);
}
}
