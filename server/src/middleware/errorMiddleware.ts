import ErrorResponse from "../errors/ErrorResponse";
import { Request, Response, NextFunction } from "express";

function errorMiddleware(
  err: ErrorResponse | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ErrorResponse) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: "Internal Server Error" });
}

export default errorMiddleware;
