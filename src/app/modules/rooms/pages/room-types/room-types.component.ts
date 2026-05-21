
// src/app/modules/rooms/pages/room-types/room-types.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../../../core/services/room.service';
import { RoomType, BedType, ViewType, getBedTypeLabel, getViewTypeLabel, formatPrice, Amenity } from '../../../../core/models/room.model';
import { AmenityService } from '../../../../core/services/amenity.service';

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

  amenityOptions!: Amenity[];
private roomService: RoomService = inject(RoomService);
  private changeDet = inject(ChangeDetectorRef);
  amenityService = inject(AmenityService);
  cdr = inject(ChangeDetectorRef);
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
      amenities: [[]],
      isActive: [false, [Validators.required]]

    });
  }

  ngOnInit(): void {
     this.loadAmenities();
    this.loadRoomTypes();

  }
  loadAmenities() {
    this.amenityService.getAmenities().subscribe({
      next: (amenities:Amenity[]) => {
      //  this.amenityOptions = amenities;
        this.amenityOptions = amenities.map(({ roomAmenities, roomTypeAmenities, ...cleanAmenity }: any) => cleanAmenity);
      //  console.log('Loaded amenities:', this.amenityOptions);
      },
      error: (error) => {
        console.error('Error loading amenities:', error.message || error);
        this.toastr.error('Failed to load amenities', 'Error');
      }
    });
  }

  loadRoomTypes(): void {
    this.isLoading = true;
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.roomTypes = response.data;
          this.isLoading = false;
          console.log('Loaded room types:', this.roomTypes);
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
      amenities: [],
      isActive: false
    });
  }

  openEditModal(roomType: RoomType): void {
    this.isEditing = true;
    console.log('Editing room type:', roomType);
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
      amenities: roomType.amenities || [],
      isActive: roomType.isActive
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
console.log('Form Value:', formValue);
 //   return;
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
       //   console.log(error)
this.cdr.detectChanges();
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

  isAmenitySelected(amenity: Amenity): boolean {
    const amenities = this.roomTypeForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  toggleAmenity(amenity: Amenity): void {
    const amenities = this.roomTypeForm.get('amenities')?.value || [];
    if (amenities.includes(amenity)) {
      this.roomTypeForm.patchValue({ amenities: amenities.filter((a: Amenity) => a !== amenity) });
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
