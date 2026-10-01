import type { RequestHandler } from "express";

const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export { notFound };
