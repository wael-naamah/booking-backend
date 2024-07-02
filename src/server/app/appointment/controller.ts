import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer, getService } from "../clients";
import {
  AddAppointmentRequest,
  Appointment,
  AppointmentForm,
  AppointmentStatus,
  EmailTemplateType,
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
      contact?.email
    );

    let newContactEmail = existingContact ? `<p>Liebe Kund*innen,</p><br>Ihr Konto wurde erfolgreich erstellt. Wir empfehlen Ihnen, sich auf der <a href='https://bgas-kalender.at/login'>Website</a> mit den folgenden Anmeldeinformationen anzumelden und aus Sicherheitsgründen Ihr Passwort zu ändern:<br>E-Mail: ${contact.email}<br>Passwort: ${contact.password}<br><p>Vielen Dank, dass Sie unsere Dienste gewählt haben.</p><p>Mit freundlichen Grüßen,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>` : ''
    let newContactSubject = "B-Gas Kontoerstellung";

    if (existingContact) {
      // @ts-ignore
      conatctId = existingContact._doc._id;
      // @ts-ignore
      const updatedContact = {...existingContact._doc, ...contact, password: existingContact._doc.password}
      contactObg = await service.contactService.updateContact(conatctId, updatedContact);
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
    const formatTime = (time: string) => {
      const date = new Date(time);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
  };

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
        contract_number: form.contract_number || undefined,
        imported_service_name: form.imported_service_name || undefined,
        imported_service_duration: form.imported_service_duration || undefined,
        imported_service_price: form.imported_service_price || undefined,
        attachments: form.attachments || undefined,
        remarks: form.remarks || undefined,
        employee_attachments: form.employee_attachments || undefined,
        appointment_status: form.appointment_status || AppointmentStatus.Confirmed,
        employee_remarks: form.employee_remarks || undefined,
        company_remarks: form.company_remarks || undefined,
        created_by: form.created_by || undefined,
        ended_at: form.ended_at || undefined,
        control_points: form.control_points || undefined,
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
        "Sehr geehrter Kunde, wir haben Ihre Bewerbung erhalten und werden uns bald mit Ihnen in Verbindung setzen!<p>beste grüße,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>";
      let subject = "B-Gas Dienstleistungen";
      const emailTemplate =
        await service.emailService.getEmailTemplatesByServiceId(
          form.service_id
        );

      if (emailTemplate && emailTemplate.template) {
        const serviceName = await service.appointmentService.getServiceNameByCategory(form.category_id, form.service_id);
        const formattedStartDate = dataObject.start_date.toLocaleDateString("de-DE", { 
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedStartTime = formatTime(dataObject.start_date);
        const formattedEndTime = formatTime(dataObject.end_date);
        email = emailTemplate.template
          .replace('B_Performance', serviceName)
          .replace('B_Salutation', contactObject.salutation)
          .replace('B_First_Name', contactObject.first_name)
          .replace('B_Last_Name', contactObject.last_name)
          .replace('B_Date', formattedStartDate)
          .replace('B_Start_Time', formattedStartTime)
          .replace('B_End_Time', formattedEndTime)
          .replace('B_Address', contactObject.address)
          .replace('B_ZIP', contactObject.zip_code)
          .replace('B_Location', contactObject.location)
          .replace('B_Telephone', contactObject.telephone)
          .replace('B_Email', contactObject.email)
          .replace('B_Brand', dataObject.brand_of_device)
          .replace('B_Model', dataObject.model)
          .replace('B_Year', dataObject.year)
          .replace('B_Notes', dataObject.remarks);
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
  static async getAppointmentsByDateAndCalenderId(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    const XLSX = require("xlsx");
    const serviceContainer = (request as any).service as ServiceContainer;
    const body = request.body;
    const { calendar_id, start_date, end_date } = body;

    const data =
      await serviceContainer.appointmentService.getAppointmentsByDateAndCalendarIdId(
        calendar_id,
        start_date,
        end_date
      );

      const transformedData: any[] = [];

      await Promise.all(
        data.map(async (item: any) => {
          const { service, appointment } = item;

          const contact = await serviceContainer.contactService.getContactById(
            appointment.contact_id
          );

          const serviceInfo = service.services[0];

          transformedData.push({
            "Service ID": serviceInfo?._id,
            "Service Name": serviceInfo?.name,
            "Service Description": serviceInfo?.description,
            "Service Duration (minutes)": serviceInfo?.duration,
            "Service Price": serviceInfo?.price,
            "Service Abbreviation ID": serviceInfo?.abbreviation_id,
            "Contact First Name": contact?.first_name,
            "Contact Last Name": contact?.last_name,
            "Contact Address": contact?.address,
            "Contact Zip Code": contact?.zip_code,
            "Contact Location": contact?.location,
            "Contact Telephone": contact?.telephone,
            "Contact Email": contact?.email,
          });
        })
      );

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(transformedData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="exported_data.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
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
    const { updated_by, ...rest } = form;
    const data = await service.appointmentService.updateAppointment(
      categoryId,
      rest
    );
    const emailConfig = await getService().emailService.getEmailConfig();

    if (rest.appointment_status === AppointmentStatus.Cancelled) {
      if (updated_by === 'contact') {
        if (emailConfig && emailConfig.length) {
          getService().emailService.sendMail({
            to: emailConfig[0].sender,
            subject: "Absage eines B-Gas-Termins",
            // @ts-ignore
            text: "Termin (" + rest.start_date + " - " + rest.end_date + ") wurde vom Kunden storniert: " + contact?._doc?.email,
          });
        }


      } else {
        let email =
        "Sehr geehrter Kunde, Ihr Termin wurde abgesagt";
        let subject = "Absage eines B-Gas-Termins";
        const emailTemplate =
          await service.emailService.getEmailTemplates(
            EmailTemplateType.Cancellation
          );

        if (emailTemplate && emailTemplate[0] && emailTemplate[0].template) {
          email = emailTemplate[0].template;
          subject = emailTemplate[0].subject;
        }

        getService().emailService.sendMail({
          // @ts-ignore
          to: contact?._doc?.email || "",
          subject: subject,
          text: email,
        });

        if (emailConfig && emailConfig.length) {
          getService().emailService.sendMail({
            to: emailConfig[0].sender,
            subject: subject,
            text: email,
          });
        }
      }
    }

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
