export interface User {
    id: number;
    username: string;
    email: string;
    role_id: number;
    role_name?: string;
    avatar: string;
    status: number;
    created_at: string;
    updated_at: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    access_token: string;
    user: User;
}
export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}
export interface Permission {
    id: number;
    module: string;
    action: string;
    description: string;
}
export interface RolePermission {
    role_id: number;
    permission_id: number;
}
//# sourceMappingURL=user.d.ts.map