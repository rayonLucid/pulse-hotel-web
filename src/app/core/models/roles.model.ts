// models/role.model.ts
export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
