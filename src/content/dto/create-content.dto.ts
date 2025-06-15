import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BlockDto {
  @IsString()
  type: 'text' | 'image' | 'video';

  @IsString()
  value: string;
}

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks: BlockDto[];
}
