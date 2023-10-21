import { Appointment } from "../Schema";

export interface AppointmentDao {
  getAppointments(
    start: Date,
    end: Date,
    search?: string
  ): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | null>;
  addAppointment(appointment: Partial<Appointment>): Promise<Appointment>;
  updateAppointment(id: string, newAppointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<Appointment | null>;

}
