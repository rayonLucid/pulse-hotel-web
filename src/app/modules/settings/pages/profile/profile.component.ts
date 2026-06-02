// src/app/modules/settings/pages/profile/profile.component.ts
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { SettingsSidebarComponent } from '../../components/settings-sidebar/settings-sidebar.component';
import { StaffService } from '../../../../core/services/staff.service';
import { Department } from '../../../../core/models/ department.model';
import { DepartmentService } from '../../../../core/services/department';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/models/roles.model';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsSidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  user!: User | null;
  Roles:Role[]=[]
depts:Department[]=[]
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr :ChangeDetectorRef,
    private userService:StaffService,
    private toastr: ToastrService,
    private deptService:DepartmentService,
    private roleService:RoleService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      department: [''],
      position: ['']

    });
  }

  ngOnInit(): void {
this.LoadRoles()
    this.loadDepartments()
    this.loadUserData();
  }

  LoadRoles() {
    this.roleService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.Roles = response.data;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageSrc: string | null = null;
  selectedFile: File | null = null;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.selectedFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.cdr.detectChanges()
      };
      reader.readAsDataURL(file);
    }
  }

  // Optional: Reset/clear the image
  clearImage(): void {
    this.imageSrc = null;
    this.selectedFile = null;
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

loadDepartments(){
  this.deptService.getDepartments(true).subscribe({
    next:(response)=>{
     // console.log(response)
      this.depts =response.data
    },
    error(err) {
     console.log(err)
    },
  })
}
  loadUserData(): void {
     this.user = this.authService.getCurrentUser();
  // console.log('Loaded user data:', this.user);
   this.loadUserInfo()

  }
  loadUserInfo() {
    this.userService.getStaffById(this.user?.userId!)
    .subscribe({
      next:(response)=>{
      //  console.log(response)
             if (response.success) {
      this.profileForm.patchValue({
        fullName: response.data.firstName +" "+response.data.lastName,
        email:  response.data.email,
        phoneNumber: response.data.phoneNumber,
        department:response.data.department,
        position:response.data.position
      });
      this.cdr.detectChanges()
    }
      }
    })
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    // Call API to update profile
    setTimeout(() => {
      this.isSaving = false;
      this.toastr.success('Profile updated successfully', 'Success');
    }, 1000);
  }
}
