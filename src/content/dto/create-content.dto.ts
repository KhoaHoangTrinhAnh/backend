// D:\backend\src\content\dto\create-content.dto.ts
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Block } from '../interfaces/block.interface';

class BlockDto {
  @IsString()
  type: 'text' | 'image' | 'video';

  @IsString()
  value: string;
}

export class CreateContentDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks: Block[];
}
