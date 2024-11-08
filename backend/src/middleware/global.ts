/** Autor: @elsoprimeDev */

import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ message: "Ocurrió un error en el servidor" });
}