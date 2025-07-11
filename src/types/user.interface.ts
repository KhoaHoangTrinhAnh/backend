import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'editor' | 'client';
  createdAt: Date;
  updatedAt: Date;
}