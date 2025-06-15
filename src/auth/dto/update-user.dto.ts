export class UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'client';
}