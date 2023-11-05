import express from "express";
import AppointmentsControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/appointments",
    injectService,
    ValidateSchema.prepare(schemas.addAppointmentSchema),
    AppointmentsControllers.addAppointment
  );
  app.get(
    "/appointments",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getAppointmentsSchema, "query"),
    AppointmentsControllers.getAppointments
  );
  app.put(
    "/appointments/:categoryId",
    injectService,
    ValidateSchema.prepare(schemas.updateAppointmentSchema),
    AppointmentsControllers.updateAppointment
  );
  app.delete(
    "/appointments/:categoryId",
    injectService,
    AppointmentsControllers.deleteAppointment
  );
  app.get(
    "/appointments/timeslots", 
    injectService,
    ValidateSchema.prepare(schemas.getTimeSlotsSchema),
    AppointmentsControllers.getTimeSlots
  );
};
