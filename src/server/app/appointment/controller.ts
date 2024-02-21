import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer, getService } from "../clients";
import {
  AddAppointmentRequest,
  Appointment,
  AppointmentForm,
  TimeSlotsForm,
} from "../../../database-client/src/Schema";
import { hashPassword } from "../middlewares/authMiddleware";

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
    let conatctId = "";
    let contactObg = null;

    const existingContact = await service.contactService.getContactByEmail(
      contact.email
    );
    let newContactEmail = `<p>Dear Customer,</p><p>Your account has been successfully created. We recommend logging in to the <a href='https://booking-frontend-waels-projects-d2811c36.vercel.app/login'>website</a> using the following credentials and change your password for security reasons:</p>email: ${contact.email}<br>password: ${contact.password}<br><p>Thank you for choosing our services.</p><p>Best Regards,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>`
    let newContactSubject = "B-Gas Account Creation";

    if (existingContact) {
      // @ts-ignore
      conatctId = existingContact._doc._id;
      // @ts-ignore
      contactObg = existingContact._doc;
    } else {
      const encryptedPassword = contact.password ? await hashPassword(contact.password) : undefined;

      const updatedContact = {
        ...contact,
        password: encryptedPassword,
      };
      
      const newContact = await service.contactService.addContact(updatedContact);
      if (newContact && newContact._id) {
        conatctId = newContact._id;
        // @ts-ignore
        contactObg = newContact._doc;
        getService().emailService.sendMail({
          to: contact.email,
          subject: newContactSubject,
          text: newContactEmail,
        });
      }
    }

    if (conatctId) {
      const newAppointment: AddAppointmentRequest = {
        category_id: form.category_id,
        service_id: form.service_id,
        calendar_id: form.calendar_id,
        start_date: form.start_date,
        end_date: form.end_date,
        contact_id: conatctId,
        brand_of_device: form.brand_of_device,
        model: form.model,
        exhaust_gas_measurement: Boolean(form.exhaust_gas_measurement),
        has_maintenance_agreement: Boolean(form.has_maintenance_agreement),
        has_bgas_before: Boolean(form.has_bgas_before),
        year: form.year || undefined,
        invoice_number: form.invoice_number || undefined,
        attachments: form.attachments || undefined,
        remarks: form.remarks || undefined,
        employee_attachments: form.employee_attachments || undefined,
        employee_remarks: form.employee_remarks || undefined,
        company_remarks: form.company_remarks || undefined,
        created_by: form.created_by || undefined,
        ended_at: form.ended_at || undefined,
      };
      const data = await service.appointmentService.addAppointment(
        newAppointment
      );

      // @ts-ignore
      const dataObject = { ...data._doc };
      const contactObject = { ...contactObg };

      const dataWithContact = {
        ...dataObject,
        contact: contactObject,
      };

      let email =
        "Dear Customer we have received your application and we will contact you soon!";
      let subject = "B-Gas Services";
      const emailTemplate =
        await service.emailService.getEmailTemplatesByServiceId(
          form.service_id
        );

      if (emailTemplate && emailTemplate.template) {
        email = emailTemplate.template;
        subject = emailTemplate.subject;
      }

      getService().emailService.sendMail({
        to: contactObject.email,
        subject: subject,
        text: email,
      });
      
      const emailConfig = await getService().emailService.getEmailConfig();

      if (emailConfig && emailConfig.length) {
        getService().emailService.sendMail({
          to: emailConfig[0].sender,
          subject: subject,
          text: email,
        });
      }
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
    const data = await service.appointmentService.getAppointments(start, end);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getAppointmentsByContactId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments by contactId';
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
    const data = await service.appointmentService.getAppointmentsByContactId(
      request.params.contactId
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getAppointmentsByCalendarId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Appointment'];

    /*
        #swagger.description = 'Endpoint to get all appointments by contactId';
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
    const data = await service.appointmentService.getAppointmentsByCalendarId(
      request.params.calendarId
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
    const contact = await service.contactService.getContactById(
      form.contact_id
    );
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
