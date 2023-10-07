import express from "express";
import { getService, ServiceContainer } from "../clients/index";

export const injectService: express.RequestHandler = async (req, res, next) => {
  let service: ServiceContainer;
  service = getService();

  (req as any).service = service;
  next();
};
