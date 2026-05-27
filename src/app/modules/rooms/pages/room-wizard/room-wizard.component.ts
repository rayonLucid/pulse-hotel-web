
// room-wizard.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { RoomType, Amenity, ViewTypes, BedTypes, RoomTypeAmenities } from '../../../../core/models/room.model';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';


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
AmenityIdList:number[] =[];
  // Lookup data
  selectedRoomType! : RoomType;
  roomTypes: RoomType[] = [];
  viewTypes: ViewTypes[] = [];
  bedTypes: BedTypes[] = [];
  amenities: Amenity[] = [];
  roomTypeAmenities:RoomTypeAmenities[] =[]
  statuses = ['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved'];
  roomservice =inject(RoomService)
cdr =inject(ChangeDetectorRef)
toastService =inject(ToastrService)
  // Reactive form
  roomForm: FormGroup;
existingAmenities:RoomTypeAmenities[] = [];
  // UI helpers
  stepNames = [
    'Basic Information',
    'Room Features',
    // 'Bed Configuration',
      'Amenities',
    'Room Images',

    'Pricing & Discounts',
    'Review & Save'
  ];
  roomInfo: any;

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
      bedType:[''],

      roomImages :this.fb.array([]),
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

 this.roomInfo =  this.roomTypes.find(x =>x.roomTypeId ==Number(event.target.value))!
  let viewTypeInfo:any =   this.viewTypes.find(x =>x.viewName ==this.roomInfo.viewType)
 this.roomForm.get('roomSize')?.setValue(this.roomInfo?.roomSize)
 this.roomForm.get('viewTypeId')?.setValue(viewTypeInfo.viewTypeId)
this.roomForm.get('basePriceOverride')?.setValue(this.roomInfo?.basePrice)
 this.selectedRoomType = this.roomTypes.find(x =>x.roomTypeId ==Number(event.target.value))!;
    this.existingAmenities = this.roomTypeAmenities.filter(x =>x.roomTypeId ==this.selectedRoomType.roomTypeId)

    this.AmenityIdList = this.existingAmenities.map(x => x.amenityId);
    this.roomForm.patchValue({
      bedType:this.roomInfo.bedType
    })

  }


  ngOnDestroy(): void {
    // Cleanup if needed
  }



get roomImages(): FormArray {
  return this.roomForm.get('roomImages') as FormArray;
}

// Method to insert a blank entry row
addRoomImage(): void {
  const imageGroup = this.fb.group({
    imageId:[0],
    imageUrl: ['', Validators.required],
    caption: [''],
    isPrimary: [this.roomImages.length === 0] // Default first element to true
  });
  this.roomImages.push(imageGroup);
}

// Method to clear a row out
removeRoomImage(index: number): void {
  this.roomImages.removeAt(index);
}

// Ensures only ONE image is checked as primary at any point
onPrimaryImageChanged(selectedIndex: number): void {
  this.roomImages.controls.forEach((control, idx) => {
    control.get('isPrimary')?.setValue(idx === selectedIndex, { emitEvent: false });
  });
}




onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000; // Limit image dimensions to a reasonable scale
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG at 75% quality. Returns a lightweight base64 string.
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            this.imagePreviews.push(compressedBase64);
          this.addRoomImageRow(compressedBase64, file.name.split('.')[0],index);
        };
      };
    });
  }
imagePreviews: string[] = [];
  addRoomImageRow(base64String: string, defaultCaption: string,index:number): void {
     const imageGroup = this.roomImages.at(index) as FormGroup;
    //  imageGroup.get('imageUrl')?.setValue(base64String);
    //    imageGroup.get('caption')?.setValue(defaultCaption);
    //    let numImages:boolean =this.roomImages.length === 0;
    //     imageGroup.get('isPrimary')?.setValue(numImages);
    //     imageGroup.get('imageId')?.setValue(0);

     imageGroup.patchValue({
      imageId: [0],
      imageUrl: [base64String, Validators.required],
      caption: [defaultCaption],
      isPrimary: [this.roomImages.length === 0] // Auto-check true for the first image
    });
   // this.roomImages.push(imageGroup);
  }
  // Convenience getters


  get selectedAmenities(): number[] {
    return this.roomForm.get('selectedAmenities')?.value || [];
  }




  loadLookups(): void {
  this.isLoading = true;

  this.wizardService.getLookups()
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response:any) => {
        this.roomTypes = response.data.roomTypes;
        this.roomTypeAmenities = response.data.roomTypeAmenities;
        this.viewTypes = response.data.viewTypes;
      //  this.bedTypes = response.data.bedTypes;
        this.amenities = response.data.amenities;
      //  console.log(  this.roomTypes )
      },
      error: (error) => {
        console.error('Error Loading:', error);
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
      next: (response) => {
        // Patch basic info
        this.roomForm.patchValue({
          roomNumber: response.data.roomNumber,
          roomTypeId: response.data.roomTypeId,
          floorNumber: response.data.floorNumber,
          roomSize: response.data.roomSize,
          viewTypeId: response.data.viewTypeId,
          isSmoking: response.data.isSmoking,
          isAccessible: response.data.isAccessible,
          basePriceOverride: response.data.basePriceOverride,
          weeklyDiscount: response.data.weeklyDiscount,
          monthlyDiscount: response.data.monthlyDiscount,
          status: response.data.status,
          bedType:response.data.bedType,
          isActive: response.data.isActive,
          selectedAmenities:response. data.amenities?.map((a: any) => a.amenityId) || [],
          roomImages:response.data.roomImages
        });



        this.roomId = roomId;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.isLoading = false;
      }
    });
  }





  // Toggle amenity selection
  toggleAmenity(amenityId: number): void {
  //  console.log(this.AmenityIdList)

    const current = this.AmenityIdList;
    const index = current.indexOf(amenityId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(amenityId);
    }
    this.roomForm.get('selectedAmenities')?.setValue([...current]);
   // console.log(this.roomForm.get('selectedAmenities')?.value)
  }

  isAmenitySelected(amenityId: number): boolean {
    return this.AmenityIdList.includes(amenityId);
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
          this.toastService.warning('Please enter room number');
          return false;
        }
        if (!basic.roomTypeId) {
           this.toastService.warning('Please select room type');
          return false;
        }
        if (basic.floorNumber === null || basic.floorNumber === undefined) {
           this.toastService.warning('Please enter floor number');
          return false;
        }
        return true;



      default:
        return true;
    }
  }

  // Get selected room type object
  getSelectedRoomType(): RoomType | undefined {
    const roomTypeId = this.roomForm.get('roomTypeId')?.value;
    let PriceInfo = this.roomTypes.find(rt => rt.roomTypeId === roomTypeId);
    console.log(PriceInfo)
   //
//this.cdr.detectChanges()
    return PriceInfo
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
    return this.amenities.filter(a => this.AmenityIdList.includes(a.amenityId!));
  }

  // Prepare data for saving
//   prepareSaveData(): any {
//     const formValue = this.roomForm.value;
//     const saveData: any = {
//       roomId: this.roomId || null,
//       roomNumber: formValue.roomNumber,
//       roomTypeId: formValue.roomTypeId,
//       floorNumber: formValue.floorNumber,
//       roomSize: formValue.roomSize,
//       viewTypeId: formValue.viewTypeId,
//       isSmoking: formValue.isSmoking,
//       isAccessible: formValue.isAccessible,
//       basePriceOverride: formValue.basePriceOverride,
//       weeklyDiscount: formValue.weeklyDiscount,
//       monthlyDiscount: formValue.monthlyDiscount,
//       status: formValue.status,
//       isActive: formValue.isActive

//     };
//  this.roomImages.controls.forEach((group, idx) => {
//     const url = group.get('imageUrl')?.value;
//     if (url) {
//       formValue.append(`imageUrl[${idx}]`, url);
//       formValue.append(`captions[${idx}]`, group.get('caption')?.value);
//       formValue.append(`isPrimary[${idx}]`, group.get('isPrimary')?.value);
//     }
//   });
//     // // Bed configurations
//     // if (this.bedConfigurations.length > 0) {
//     //   saveData.bedsJson = JSON.stringify(
//     //     this.bedConfigurations.value.map((bed: any) => ({
//     //       bedTypeId: bed.bedTypeId,
//     //       quantity: bed.quantity
//     //     }))
//     //   );
//     // }

//     // Amenities
//     if (formValue.selectedAmenities.length > 0) {
//       saveData.amenitiesJson = JSON.stringify(
//         formValue.selectedAmenities.map((id: number) => ({ amenityId: id }))
//       );
//     }

//     return saveData;
//   }

prepareSaveData(): any {

  const formValue= this.roomForm.value;

  // Append all basic fields as JSON (or individually)
  const roomData = {
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
    isActive: formValue.isActive,
    amenitiesJson: formValue.selectedAmenities?.length ? formValue.selectedAmenities: null,
    roomImages:formValue.roomImages?.length?formValue.roomImages:null
  };

  return roomData;
}

  saveRoom(): void {
    this.isSaving = true;
    const saveData = this.prepareSaveData();
console.log(saveData)
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
