// room-wizard.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { RoomType, Amenity, ViewTypes, BedTypes } from '../../../../core/models/room.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-room-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-wizard.component.html',
  styleUrls: ['./room-wizard.component.scss']
})
export class RoomWizardComponent implements OnInit, OnDestroy {
  private wizardService = inject(RoomService);
  private fb = inject(FormBuilder);

  // Wizard state
  currentStep = 1;
  totalSteps = 6;
  roomId: number | null = null;
  isLoading = false;
  isSaving = false;

  // Lookup data
  roomTypes: RoomType[] = [];
  viewTypes: ViewTypes[] = [];
  bedTypes: BedTypes[] = [];
  amenities: Amenity[] = [];
  statuses = ['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved'];
  roomservice =inject(RoomService)
cdr =inject(ChangeDetectorRef)
toastService =inject(ToastrService)
  // Reactive form
  roomForm: FormGroup;

  // UI helpers
  stepNames = [
    'Basic Information',
    'Room Features',
    'Bed Configuration',
    'Amenities',
    'Pricing & Discounts',
    'Review & Save'
  ];

  constructor() {
    this.roomForm = this.fb.group({
      // Step 1
      roomNumber: ['', Validators.required],
      roomTypeId: [null, Validators.required],
      floorNumber: [null, [Validators.required, Validators.min(0)]],
      roomSize: [null],
      // Step 2
      viewTypeId: [null],
      isSmoking: [false],
      isAccessible: [false],
      // Step 3
      bedConfigurations: this.fb.array([]),
      // Step 4
      selectedAmenities: [[]],
      // Step 5
      basePriceOverride: [null],
      weeklyDiscount: [null, [Validators.min(0), Validators.max(100)]],
      monthlyDiscount: [null, [Validators.min(0), Validators.max(100)]],
      // Step 6
      status: ['Available', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
  //  this.loadRoomTypes()
  //  this.loadBedTypes()
    //this.loadViewTypes()
    this.loadLookups();
  }
  loadViewTypes() {
   this.roomservice.getViewTypes().subscribe({
      next:(response)=>{
        this.viewTypes =response.data
      },
      error:(err)=>{
        this.toastService.error(err.error.message)
           console.log(err.error.message)
      }
    })
  }
  loadBedTypes() {
     this.roomservice.getBedTypes().subscribe({
      next:(response)=>{
       // console.log(response)
        this.bedTypes =response.data
      },
      error:(err)=>{
        this.toastService.error(err.error.message)
           console.log(err.error.message)
      }
    })
  }
  GetRoomSize(event:any){

 let roomSize =  this.roomTypes.find(x =>x.roomTypeId ==Number(event.target.value))?.roomSize

 this.roomForm.get('roomSize')?.setValue(roomSize)
  }
  loadRoomTypes() {
    this.roomservice.getRoomTypes().subscribe({
      next:(response)=>{
        this.roomTypes =response.data

      },
      error:(err)=>{
        this.toastService.error(err.error.message)
        console.log(err.error.message)
      }
    })
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Convenience getters
  get bedConfigurations(): FormArray {
    return this.roomForm.get('bedConfigurations') as FormArray;
  }

  get selectedAmenities(): number[] {
    return this.roomForm.get('selectedAmenities')?.value || [];
  }

  // Load lookups from API
  loadLookups(): void {
    this.isLoading = true;
    this.wizardService.getLookups().subscribe({
      next: (response) => {
        this.roomTypes = response.data.roomTypes;
        this.viewTypes = response.data.viewTypes;
        this.bedTypes = response.data.bedTypes;
        this.amenities =response.data.amenities;
        this.isLoading = false;
      //  console.log( response.data.amenities)
        // console.log( this.bedTypes,"data")
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading lookups:', error);
        this.isLoading = false;
        this.cdr.detectChanges()
      }
    });
  }
getAmenityColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert the hash into a 6-digit hex code
  let color = '#';
  for (let i = 0; i < 3; i++) {
    // Extract a byte value (0-255) from the hash
    const value = (hash >> (i * 8)) & 0xFF;
    // Format it as a 2-digit hex string and append
    color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
}
  // Load existing room data for edit
  loadRoom(roomId: number): void {
    this.isLoading = true;
    this.wizardService.getRoom(roomId).subscribe({
      next: (data) => {
        // Patch basic info
        this.roomForm.patchValue({
          roomNumber: data.roomNumber,
          roomTypeId: data.roomTypeId,
          floorNumber: data.floorNumber,
          roomSize: data.roomSize,
          viewTypeId: data.viewTypeId,
          isSmoking: data.isSmoking,
          isAccessible: data.isAccessible,
          basePriceOverride: data.basePriceOverride,
          weeklyDiscount: data.weeklyDiscount,
          monthlyDiscount: data.monthlyDiscount,
          status: data.status,
          isActive: data.isActive,
          selectedAmenities: data.amenities?.map((a: any) => a.amenityId) || []
        });

        // Clear existing bed configs and add saved ones
        this.bedConfigurations.clear();
        if (data.beds && data.beds.length) {
          data.beds.forEach((bed: any) => {
            this.bedConfigurations.push(this.createBedGroup(bed.bedTypeId, bed.quantity));
          });
        }

        this.roomId = roomId;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.isLoading = false;
      }
    });
  }

  // Create a bed FormGroup
  createBedGroup(bedTypeId: number = 0, quantity: number = 1): FormGroup {
    return this.fb.group({
      bedTypeId: [bedTypeId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1), Validators.max(10)]],
      bedTypeName: ['']
    });
  }

  // Add new bed configuration
  addBedConfiguration(): void {
    this.bedConfigurations.push(this.createBedGroup());
  }

  // Remove bed configuration at index
  removeBedConfiguration(index: number): void {
    this.bedConfigurations.removeAt(index);
  }

  // Update bed type name for display (optional, for review)
  updateBedTypeName(index: number): void {
    const bedGroup = this.bedConfigurations.at(index) as FormGroup;
    const bedTypeId = bedGroup.get('bedTypeId')?.value;
    const bedType = this.bedTypes.find(bt => bt.bedTypeId === bedTypeId);
    if (bedType) {
      bedGroup.get('bedTypeName')?.setValue(bedType.bedTypeName);
    }
  }

  // Toggle amenity selection
  toggleAmenity(amenityId: number): void {
    const current = this.selectedAmenities;
    const index = current.indexOf(amenityId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(amenityId);
    }
    this.roomForm.get('selectedAmenities')?.setValue([...current]);
  }

  isAmenitySelected(amenityId: number): boolean {
    return this.selectedAmenities.includes(amenityId);
  }

  // Navigation
  nextStep(): void {
    if (this.validateStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo(0, 0);
      } else {
        this.saveRoom();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  // Step validation
  validateStep(): boolean {
    switch (this.currentStep) {
      case 1:
        const basic = this.roomForm.value;
        if (!basic.roomNumber) {
          alert('Please enter room number');
          return false;
        }
        if (!basic.roomTypeId) {
          alert('Please select room type');
          return false;
        }
        if (basic.floorNumber === null || basic.floorNumber === undefined) {
          alert('Please enter floor number');
          return false;
        }
        return true;

      case 3:
        if (this.bedConfigurations.length === 0) {
          alert('Please add at least one bed configuration');
          return false;
        }
        for (let i = 0; i < this.bedConfigurations.length; i++) {
          const bed = this.bedConfigurations.at(i).value;
          if (!bed.bedTypeId) {
            alert(`Bed ${i + 1} is missing a bed type`);
            return false;
          }
          if (!bed.quantity || bed.quantity < 1) {
            alert(`Bed ${i + 1} must have a quantity of at least 1`);
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  }

  // Get selected room type object
  getSelectedRoomType(): RoomType | undefined {
    const roomTypeId = this.roomForm.get('roomTypeId')?.value;
    return this.roomTypes.find(rt => rt.roomTypeId === roomTypeId);
  }

  // Get selected view type object
  getSelectedViewType(): ViewTypes | undefined {
    const viewTypeId = this.roomForm.get('viewTypeId')?.value;
    return this.viewTypes.find(vt => vt.viewTypeId === viewTypeId);
  }

  // Calculate total price per night
  getTotalPrice(): number {
    const roomType = this.getSelectedRoomType();
    const basePrice = this.roomForm.get('basePriceOverride')?.value || roomType?.basePrice || 0;
    const viewPremium = this.getSelectedViewType()?.premiumCharge || 0;
    return basePrice + viewPremium;
  }

  // Get amenity details for review
  getAmenityDetails(): Amenity[] {
    return this.amenities.filter(a => this.selectedAmenities.includes(a.amenityId!));
  }

  // Prepare data for saving
  prepareSaveData(): any {
    const formValue = this.roomForm.value;
    const saveData: any = {
      roomId: this.roomId || null,
      roomNumber: formValue.roomNumber,
      roomTypeId: formValue.roomTypeId,
      floorNumber: formValue.floorNumber,
      roomSize: formValue.roomSize,
      viewTypeId: formValue.viewTypeId,
      isSmoking: formValue.isSmoking,
      isAccessible: formValue.isAccessible,
      basePriceOverride: formValue.basePriceOverride,
      weeklyDiscount: formValue.weeklyDiscount,
      monthlyDiscount: formValue.monthlyDiscount,
      status: formValue.status,
      isActive: formValue.isActive
    };

    // Bed configurations
    if (this.bedConfigurations.length > 0) {
      saveData.bedsJson = JSON.stringify(
        this.bedConfigurations.value.map((bed: any) => ({
          bedTypeId: bed.bedTypeId,
          quantity: bed.quantity
        }))
      );
    }

    // Amenities
    if (formValue.selectedAmenities.length > 0) {
      saveData.amenitiesJson = JSON.stringify(
        formValue.selectedAmenities.map((id: number) => ({ amenityId: id }))
      );
    }

    return saveData;
  }

  saveRoom(): void {
    this.isSaving = true;
    const saveData = this.prepareSaveData();

    this.wizardService.saveRoom(saveData).subscribe({
      next: (response) => {
        this.isSaving = false;
        alert('Room saved successfully!');
        if (!this.roomId && response.roomId) {
          this.roomId = response.roomId;
        }
      },
      error: (error) => {
        console.error('Error saving room:', error);
        this.isSaving = false;
        alert('Error saving room. Please try again.');
      }
    });
  }
}
