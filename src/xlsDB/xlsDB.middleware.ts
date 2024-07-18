import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TransformBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(req.hostname, 'Request URL:', req.originalUrl);
    if (req.body) {
      req.body = this.transform(req.body);
    }
    next();
  }

  private transform(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim().toLowerCase();
    }
    if (typeof obj === 'number') {
      return obj.toString();
    } else if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const newObj: any = {};
      for (const key in obj) {
        if (key === 'sheetId' || key === 'sheetName') {
          newObj[key] = obj[key];
          continue;
        }
        if (obj.hasOwnProperty(key)) {
          newObj[key] = this.transform(obj[key]);
        }
      }
      return newObj;
    } else {
      return obj;
    }
  }
}
