import {
  AppointmentDaoMongo,
  Appointment,
  CategoryDaoMongo,
  AddAppointmentRequest,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class AppointmentsService {
  constructor(
    private appointmentDao: AppointmentDaoMongo,
    private categoryDao: CategoryDaoMongo
  ) {}

  async addAppointment(appointment: AddAppointmentRequest) {
    
    const servise = await this.categoryDao.getServiceByCategoryIdAndServiceId(
      appointment.category_id,
      appointment.service_id
    );

    if (servise) {
      // @ts-ignore
      const serviceAbbreviationId = servise.services[0].abbreviation_id;
      const savedData: Appointment = {
        ...appointment,
        service_abbreviation_id: serviceAbbreviationId,
      };
      
      return this.appointmentDao
        .addAppointment(savedData)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new ClientError(
            "Something went wrong while add the appointment",
            500
          );
        });
    } else {
      throw new ClientError(
        "Cann't find service with Id " + appointment.service_id + " and category Id" + appointment.category_id,
        404
      );
    }
  }

  async getAppointmentById(id: string) {
    return this.appointmentDao
      .getAppointmentById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateAppointment(id: string, newAppointment: Appointment) {
    return this.appointmentDao
      .updateAppointment(id, newAppointment)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while update the appointment",
          500
        );
      });
  }

  async getAppointments(start: Date, end: Date, search?: string) {
    return this.appointmentDao
      .getAppointments(start, end, search)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while fetching appointments",
          500
        );
      });
  }

  async deleteAppointment(id: string) {
    return this.appointmentDao
      .deleteAppointment(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while delete the appointment",
          500
        );
      });
  }
}
