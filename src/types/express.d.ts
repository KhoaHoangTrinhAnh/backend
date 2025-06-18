// D:\backend\src\types\express.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      email?: string;
      sub?: string;
      role?: string;
    };
  }
}
