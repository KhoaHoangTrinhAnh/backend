// D:\backend\src\content\content.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Content extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ type: Object }], default: [] })
  blocks: Array<{ type: 'text' | 'image' | 'video'; data: any }>;

  @Prop() status?: 'draft' | 'submitted';

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  updatedBy: string;

  @Prop() createdAt?: Date;

  @Prop() updatedAt?: Date;
}

export type ContentDocument = Content & Document;
export const ContentSchema = SchemaFactory.createForClass(Content);
