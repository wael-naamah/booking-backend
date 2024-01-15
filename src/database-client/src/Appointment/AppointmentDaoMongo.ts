import { schema } from "./AppointmentSchema";
import { Model, Document, Connection } from "mongoose";
import { AddAppointmentRequest, Appointment } from "../Schema";
import { AppointmentDao } from "./AppointmentDao";

export class AppointmentDaoMongo implements AppointmentDao {
  model: Model<Document<Appointment>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Appointment>>("Appointments", schema);
  }

  async addAppointment(appointment: AddAppointmentRequest): Promise<Appointment> {
    const newAppointment = new this.model(appointment);
    return newAppointment.save().then((res) => {
      return res as unknown as Appointment;
    });
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return this.model.findById(id);
  }

  async getAppointments(
    start: string,
    end: string,
  ): Promise<Appointment[]> {

    let query: any = {
      start_date: { $gte: new Date(start) },
      end_date: { $lte: new Date(end) },
    };

    return this.model
      .find(query)
      .then((data) => data as unknown as Appointment[]);
  }

  async getAppointmentsByContactId(
    conatctId: string,
  ): Promise<Appointment[]> {
    return this.model
      .find({contact_id: conatctId})
      .then((data) => data as unknown as Appointment[]);
  }

  async getAppointmentsByCalendarIdId(
    calendarId: string,
  ): Promise<Appointment[]> {
    return this.model
      .find({calendar_id: calendarId})
      .then((data) => data as unknown as Appointment[]);
  }

  async updateAppointment(id: string, newAppointment: AddAppointmentRequest) {
    return this.model
      .findByIdAndUpdate(id, newAppointment, { new: true })
      .then((res) => {
        return res as unknown as Appointment;
      });
  }

  async deleteAppointment(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as Appointment;
    });
  }
}
