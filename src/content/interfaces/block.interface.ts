// src/content/interfaces/block.interface.ts
export interface Block {
  type: 'text' | 'image' | 'video';
  value: string;
}