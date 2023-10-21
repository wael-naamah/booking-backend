import { schema } from "./AppointmentSchema";
import { Model, Document, Connection } from "mongoose";
import { Appointment } from "../Schema";
import { AppointmentDao } from "./AppointmentDao";
import { isEmptyObject, isValidNumber } from "../utils";

export class AppointmentDaoMongo implements AppointmentDao {
  model: Model<Document<Appointment>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Appointment>>("Appointments", schema);
  }

  async addAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    const newAppointment = new this.model(appointment);
    return newAppointment.save().then((res) => {
      return res as unknown as Appointment;
    });
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return this.model.findById(id);
  }

  async getAppointments(
    start: Date,
    end: Date,
    search?: string
  ): Promise<Appointment[]> {
    const isValidNo = isValidNumber(search);

    let query: any = {
      start_date: { $gte: start },
      end_date: { $lte: end },
    };

    if (search) {
      query = {
        ...query,
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { telephone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          isValidNo ? { service_abbreviation_id: Number(search) } : {},
        ].filter((el) => !isEmptyObject(el)),
      };
    }

    return this.model
      .find(query)
      .then((data) => data as unknown as Appointment[]);
  }

  async updateAppointment(id: string, newAppointment: Partial<Appointment>) {
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
