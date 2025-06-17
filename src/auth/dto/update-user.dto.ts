// D:\backend\src\auth\dto\update-user.dto.ts
export class UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'client';
}