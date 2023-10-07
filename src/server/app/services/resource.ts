import express from "express";
import ServicesControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import { checkAuth, validateToken } from "../middlewares/authMiddleware";
// import ValidateSchema from "../middlewares/validateSchema";
// import schemas from "./schemas";
// import { passwordHashHandler } from "../middlewares/authMiddleware";

export const configure = (app: express.Router) => {
  app.get(
    "/service",
    injectService,
    validateToken,
    checkAuth,
    ServicesControllers.getServices
  );
};
