// D:\backend\src\content\content.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Block } from './interfaces/block.interface';

@Schema()
export class Content {
  @Prop({ required: true })
  title: string;

  // @Prop({ type: [{ type: Object }], default: [] })
  // blocks: Array<{ type: 'text' | 'image' | 'video'; data: any }>;
  @Prop({ type: [{ type: Object }], default: [] })
  blocks: Block[];

  @Prop() status?: 'draft' | 'submitted';

  @Prop({ required: true })
  created_by: string;

  @Prop()
  updated_by: string;

  @Prop()
  created_at?: Date;

  @Prop()
  updated_at?: Date;
}

export type ContentDocument = Content & Document;
export const ContentSchema = SchemaFactory.createForClass(Content);
