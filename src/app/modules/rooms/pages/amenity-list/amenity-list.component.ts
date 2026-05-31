// amenities/amenity-list.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Amenity } from '../../../../core/models/room.model';
import { AmenityService } from '../../../../core/services/amenity.service';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-amenity-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './amenity-list.component.html',
  styleUrls: ['./amenity-list.component.scss']
})
export class AmenityListComponent implements OnInit {
  private amenityService = inject(AmenityService);
  private stockService = inject(InventoryService);
  toastService = inject(ToastrService);
  private fb = inject(FormBuilder);

  // Data
  amenities: Amenity[] = [];
  filteredAmenities: Amenity[] = [];
  stockItems: InventoryItem[] = [];

  // UI state
  loading = false;
  searchTerm = '';
  showInactive = false;

  // Modal
  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  // Reactive Form
  amenityForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
cdr = inject(ChangeDetectorRef);
  constructor() {
    this.amenityForm = this.fb.group({
      amenityName: ['', Validators.required],
      icon: [''],
      isActive: [true],
      isConsumable: [false],
      stockItemId: [null]
    });
  }

  ngOnInit(): void {
    this.loadAmenities();
    this.loadStockItems();
  }

  // Convenience getter for form controls
  get f() { return this.amenityForm.controls; }

  loadAmenities(): void {
    this.loading = true;
    this.amenityService.getAmenities().subscribe({
      next: (data) => {
        this.amenities = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck(); // Ensure UI updates after loading amenities
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.toastService.error('Failed to load amenities: ' + err.error.message);
        this.cdr.markForCheck(); // Ensure UI updates after error handling
      }
    });
  }
getIconColor(str: string): string {
  if (!str) return '#6c757d';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to RGB then hex
  const r = (hash >> 16) & 255;
  const g = (hash >> 8) & 255;
  const b = hash & 255;

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
  loadStockItems(): void {
    this.stockService.getAllItems().subscribe({
      next: (response) => {
       // console.log('Stock items loaded:', response);
        if (response.success) {
          this.stockItems = response.data;
          this.cdr.markForCheck(); // Ensure UI updates with new stock items
        }
      },
      error: (err) => {
        console.error('Failed to load stock items', err);
        this.toastService.error('Failed to load stock items: ' + err.error.message);
        this.cdr.markForCheck(); // Ensure UI updates after error handling
      }
    });
  }

  applyFilter(): void {
    let filtered = this.amenities;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.amenityName.toLowerCase().includes(term) ||
        (a.icon && a.icon.toLowerCase().includes(term))
      );
    }
    if (!this.showInactive) {
      filtered = filtered.filter(a => a.isActive);
    }
    this.filteredAmenities = filtered;
    this.currentPage = 1;
  }

  onSearch(): void {
    this.applyFilter();
  }

  toggleInactive(): void {
    this.applyFilter();
  }

  // Modal actions with reactive form
  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.amenityForm.reset({
      amenityName: '',
      icon: '',
      isActive: true,
      isConsumable: false,
      stockItemId: null
    });
    this.showModal = true;
  }

  openEditModal(amenity: Amenity): void {
    this.isEditing = true;
    this.editingId = amenity.amenityId!;
    this.amenityForm.patchValue({
      amenityName: amenity.amenityName,
      icon: amenity.icon || '',
      isActive: amenity.isActive,
      isConsumable: amenity.isConsumable || false,
      stockItemId: amenity.stockItemId || null
    });
    this.showModal = true;
  }

  closeModal(refresh = false): void {
    this.showModal = false;
    this.amenityForm.reset();
    if (refresh) this.loadAmenities();
  }

  saveAmenity(): void {
    if (this.amenityForm.invalid) {
      this.toastService.error('Please fill in required fields');
      return;
    }

    const formValue = this.amenityForm.value;
    const amenityData: Amenity = {
      amenityName: formValue.amenityName,
      icon: formValue.icon || null,
      isActive: formValue.isActive,
      isConsumable: formValue.isConsumable,
      stockItemId: formValue.isConsumable ? formValue.stockItemId : null
    };

    if (this.isEditing && this.editingId) {
      amenityData.amenityId = this.editingId;
      this.amenityService.updateAmenity(this.editingId, amenityData).subscribe({
        next: () => this.closeModal(true),
        error: (err) => this.toastService.error('Update failed: ' + err.error.message)
      });
    } else {
      this.amenityService.createAmenity(amenityData).subscribe({
        next: () => this.closeModal(true),
        error: (err) => this.toastService.error('Create failed: ' + err.error.message)
      });
    }
  }

  deleteAmenity(id: number, name: string): void {
    if (confirm(`Delete amenity "${name}"? It will be permanently removed.`)) {
      this.amenityService.deleteAmenity(id).subscribe({
        next: () => this.loadAmenities(),
        error: (err) => this.toastService.error('Delete failed: ' + err.error.message)
      });
    }
  }
}
