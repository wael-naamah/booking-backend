import express from "express";
import CategoriesControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
// import { checkAuth, validateToken } from "../middlewares/authMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/categories",
    injectService,
    ValidateSchema.prepare(schemas.addCategoriesSchema),
    CategoriesControllers.addCategory
  );
  app.get(
    "/categories",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getCategoriesSchema, 'query'),
    CategoriesControllers.getCategories
  );
  app.put(
    "/categories/:categoryId",
    injectService,
    ValidateSchema.prepare(schemas.updateCategoriesSchema),
    CategoriesControllers.updateCategory
  );
  app.delete(
    "/categories/:categoryId",
    injectService,
    CategoriesControllers.deleteCategory
  );
};
