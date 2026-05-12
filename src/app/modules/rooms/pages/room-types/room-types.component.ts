// src/app/modules/rooms/pages/room-types/room-types.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../../../core/services/room.service';
import { RoomType, BedType, ViewType, getBedTypeLabel, getViewTypeLabel, formatPrice } from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.scss']
})
export class RoomTypesComponent implements OnInit {
  roomTypes: RoomType[] = [];
  isLoading = true;
  isEditing = false;
  isSaving = false;
  showDeleteModal = false;
  selectedRoomType: RoomType | null = null;

  roomTypeForm: FormGroup;

  // Available options
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
    'Bath Tub', 'Separate Shower', 'Balcony', 'Ocean View',
    'Sea View', 'Mountain View', 'Soundproofing', 'Executive Lounge Access'
  ];
private roomService: RoomService = inject(RoomService);
  private changeDet = inject(ChangeDetectorRef);
  constructor(
    private fb: FormBuilder,

    private toastr: ToastrService
  ) {
    this.roomTypeForm = this.fb.group({
      typeName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
      basePrice: ['', [Validators.required, Validators.min(0)]],
      peakPrice: [''],
      maxAdults: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      maxChildren: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      roomSize: ['', [Validators.required, Validators.min(10)]],
      bedType: ['', [Validators.required]],
      viewType: ['', [Validators.required]],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.isLoading = true;
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.roomTypes = response.data;
          this.isLoading = false;
          this.changeDet.detectChanges();
        } else {
          this.toastr.error('Failed to load room types', 'Error');
          this.isLoading = false;
          this.changeDet.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading room type:', error);
        this.toastr.error('Failed to load room types', 'Error');
        this.isLoading = false;
        this.changeDet.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = true;
    this.selectedRoomType = null;
    this.roomTypeForm.reset({
      typeName: '',
      description: '',
      basePrice: '',
      peakPrice: '',
      maxAdults: 2,
      maxChildren: 1,
      roomSize: '',
      bedType: 'Queen',
      viewType: 'City View',
      amenities: []
    });
  }

  openEditModal(roomType: RoomType): void {
    this.isEditing = true;
    this.selectedRoomType = roomType;
    this.roomTypeForm.patchValue({
      typeName: roomType.typeName,
      description: roomType.description || '',
      basePrice: roomType.basePrice,
      peakPrice: roomType.peakPrice || '',
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      roomSize: roomType.roomSize,
      bedType: roomType.bedType,
      viewType: roomType.viewType,
      amenities: roomType.amenities || []
    });
  }

  closeModal(): void {
    this.isEditing = false;
    this.selectedRoomType = null;
    this.showDeleteModal = false;
  }

  saveRoomType(): void {
    if (this.roomTypeForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const formValue = this.roomTypeForm.value;

    if (this.selectedRoomType) {
      // Update existing
      this.roomService.updateRoomType(this.selectedRoomType.roomTypeId, formValue).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Room type updated successfully', 'Success');
            this.closeModal();
            this.loadRoomTypes();
          } else {
            this.toastr.error(response.message || 'Update failed', 'Error');
          }
        },
        error: (error:any) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to update room type', 'Error');
        }
      });
    } else {
      // Create new
      this.roomService.createRoomType(formValue).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Room type created successfully', 'Success');
            this.closeModal();
            this.loadRoomTypes();
          } else {
            this.toastr.error(response.message || 'Creation failed', 'Error');
          }
        },
        error: (error:any) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to create room type', 'Error');
        }
      });
    }
  }

  openDeleteModal(roomType: RoomType): void {
    this.selectedRoomType = roomType;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedRoomType) return;

    this.isSaving = true;
    this.roomService.deleteRoomType(this.selectedRoomType.roomTypeId).subscribe({
      next: (response:any) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Room type deleted successfully', 'Success');
          this.closeModal();
          this.loadRoomTypes();
        } else {
          this.toastr.error(response.message || 'Delete failed', 'Error');
        }
      },
      error: (error:any) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to delete room type', 'Error');
      }
    });
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.roomTypeForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.roomTypeForm.get('amenities')?.value || [];
    if (amenities.includes(amenity)) {
      this.roomTypeForm.patchValue({ amenities: amenities.filter((a: string) => a !== amenity) });
    } else {
      this.roomTypeForm.patchValue({ amenities: [...amenities, amenity] });
    }
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getBedTypeLabel(bedType: BedType): string {
    return getBedTypeLabel(bedType);
  }

  getViewTypeLabel(viewType: ViewType): string {
    return getViewTypeLabel(viewType);
  }
}
