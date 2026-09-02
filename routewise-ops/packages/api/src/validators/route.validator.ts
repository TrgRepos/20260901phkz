import { Request, Response, NextFunction } from "express";

export function validateListQuery(req: Request, res: Response, next: NextFunction): void {
  const { minDistance } = req.query;

  if (minDistance === undefined) {
    next();
    return;
  }

  const min = Number(minDistance);

  if (Number.isNaN(min) || min < 0) {
    res.status(400).json({
      error: "minDistance must be a non-negative number.",
    });
    return;
  }

  next();
}

export function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id)) {
    res.status(400).json({
      error: "id must be a positive integer.",
    });
    return;
  }

  next();
}
