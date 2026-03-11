import type { Request, Response, NextFunction } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch((err: unknown) => {
      console.error('Route error:', err);
      next(err);
    });
  };
}
