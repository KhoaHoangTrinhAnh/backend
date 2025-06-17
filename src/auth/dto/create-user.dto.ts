// D:\backend\src\auth\dto\create-user.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'editor', 'client'])
  role?: string;
}
