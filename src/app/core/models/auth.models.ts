// src/app/core/models/auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    userId: number;
    fullName: string;
    email: string;
    token: string;
    role: string;
    loyaltyPoints: number;
    tokenExpiry: Date;
  };
  message: string;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  loyaltyPoints: number;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}
