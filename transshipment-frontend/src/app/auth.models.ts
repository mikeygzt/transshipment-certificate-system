export type UserRole = "REQUESTER" | "REVIEWER" | "ADMIN";

export type UserStatus = "PENDING_CONFIRMATION" | "ACTIVE" | "DEACTIVATED";

export interface RegisterRequest {
    fullName: string;
    telephone: string;
    companyTRN: string;
    shippingAgentName: string;
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthenticatedUser {
    email: string;
    role: UserRole;
}

export interface UserResponse {
    id: string;
    fullName: string;
    telephone: string;
    companyTRN: string;
    shippingAgentName: string;
    email: string;
    role: UserRole;
    status: UserStatus;   
    createdAt: string;
}