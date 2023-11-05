import { AddAppointmentRequest, Appointment } from "../Schema";

export interface AppointmentDao {
  getAppointments(
    start: Date,
    end: Date,
    search?: string
  ): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | null>;
  addAppointment(appointment: AddAppointmentRequest): Promise<Appointment>;
  updateAppointment(id: string, newAppointment: AddAppointmentRequest): Promise<Appointment>;
  deleteAppointment(id: string): Promise<Appointment | null>;
}
