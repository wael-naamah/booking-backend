import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer } from "../clients";
import {
  AddAppointmentRequest,
  Appointment,
  AppointmentForm,
  TimeSlotsForm,
} from "../../../database-client/src/Schema";

class AppointmentsControllers {
  @tryCatchErrorDecorator
  static async addAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to add appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Appointment;
    const service = (request as any).service as ServiceContainer;

    const contact = form.contact;
    const newContact = await service.contactService.addContact(contact);

    if (newContact && newContact._id) {
      const newAppointment: AddAppointmentRequest = {
        category_id: form.category_id,
        service_id: form.service_id,
        calendar_id: form.calendar_id,
        start_date: form.start_date,
        end_date: form.end_date,
        contact_id: newContact._id,
      };
      const data = await service.appointmentService.addAppointment(
        newAppointment
      );

      // @ts-ignore
      const dataObject = { ...data._doc };
      // @ts-ignore
      const contactObject = { ...newContact._doc };

      const dataWithContact = {
        ...dataObject,
        contact: contactObject,
      };

      res.status(200).json(dataWithContact);
    } else {
      res.status(409).json({
        message: "Something went wrong while adding the conatct details",
      });
    }
  }

  @tryCatchErrorDecorator
  static async getAppointments(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const { start, end } = request.query as unknown as AppointmentForm;
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getAppointments(
      start,
      end
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to update appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddAppointmentRequest;
    const service = (request as any).service as ServiceContainer;
    const { categoryId } = request.params;
    const contact = await service.contactService.getContactById(form.contact_id);
    const data = await service.appointmentService.updateAppointment(
      categoryId,
      form
    );

    // @ts-ignore
    const dataObject = { ...data._doc };
    // @ts-ignore
    const contactObject = { ...contact._doc };

    const dataWithContact = {
      ...dataObject,
      contact: contactObject,
    };

    res.status(200).json(dataWithContact);
  }

  @tryCatchErrorDecorator
  static async deleteAppointment(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to delete appointment';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.deleteAppointment(
      request.params.categoryId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async getTimeSlots(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to delete timeslots';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const { date, category_id, service_id } =
      request.query as unknown as TimeSlotsForm;
    const service = (request as any).service as ServiceContainer;
    const data = await service.appointmentService.getTimeSlots(
      date,
      category_id,
      service_id
    );

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(200).json([]);
    }
  }
}

export default AppointmentsControllers;
