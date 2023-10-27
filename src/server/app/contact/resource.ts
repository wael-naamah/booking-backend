import express from "express";
import ContactsControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/contacts",
    injectService,
    ValidateSchema.prepare(schemas.addContactSchema),
    ContactsControllers.addContact
  );
  app.get(
    "/contacts",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getContactsSchema, "query"),
    ContactsControllers.getContacts
  );
  app.put(
    "/contacts/:contactId",
    injectService,
    ValidateSchema.prepare(schemas.updateContactSchema),
    ContactsControllers.updateContact
  );
  app.delete(
    "/contacts/:contactId",
    injectService,
    ContactsControllers.deleteContact
  );
};
