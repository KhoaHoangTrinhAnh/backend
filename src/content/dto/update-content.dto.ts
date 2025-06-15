export class UpdateContentDto {
  title?: string;
  blocks?: Array<{ type: 'text' | 'image' | 'video'; data: any }>;
}
