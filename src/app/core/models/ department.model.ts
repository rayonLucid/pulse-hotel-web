export interface Department {
   departmentId: number;
  departmentName: string;
  description: string | null;
  managerId: number | null;

  isActive: boolean;

  createdAt: Date;
  modifiedAt: Date | null;
}
