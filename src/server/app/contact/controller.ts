import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer, getService } from "../clients";
import {
  AddContactRequest,
  Contact,
  PaginatedForm,
} from "../../../database-client/src/Schema";
import { PaginatedResponse } from "../category/dto";
import { hashPassword } from "../middlewares/authMiddleware";

class ContactsControllers {
  @tryCatchErrorDecorator
  static async addContact(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to add contact';
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
    const form = request.body as unknown as AddContactRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.contactService.addContact(form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getContacts(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to get all contacts';
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
    const { page = 1, limit = 10, search } = request.query as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.contactService.getContacts(
      page,
      limit,
      search
    );

    const paginatedResult = new PaginatedResponse<Contact>(
      data,
      Number(page),
      Number(limit),
      count
    );
    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async getContactById(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to get all contacts';
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
    const { contactId } = request.params;
    const service = (request as any).service as ServiceContainer;
    const data = await service.contactService.getContactById(contactId);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateContact(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to update contact';
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
    const form = request.body as unknown as Contact;
    const service = (request as any).service as ServiceContainer;
    const { contactId } = request.params;
    const existingContact = await service.contactService.getContactById(
      contactId
    );

    if (existingContact) {
      const data = await service.contactService.updateContact(contactId, form);

      res.status(200).json(data);
    } else {
      res.status(404).json({ messege: "User not found" });
    }
  }

  @tryCatchErrorDecorator
  static async deleteContact(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Contact'];

    /*
        #swagger.description = 'Endpoint to delete contact';
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
    const data = await service.contactService.deleteContact(
      request.params.contactId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async sendContactCredentials(
    request: Request,
    res: Response,
    next: NextFunction
  ){
    const {password} = request.body as unknown as {password: string};
    const service = (request as any).service as ServiceContainer;
    const { contactId } = request.params;
    const existingContact = await service.contactService.getContactById(
      contactId
    );

    if (existingContact) {
      const hashedPassword = await hashPassword(password);
      await service.contactService.updateContact(contactId, {
        ...existingContact,
        password: hashedPassword,
      });
      
      let email = `<p>Dear Customer,</p><p>Your account has been successfully updated. We recommend logging in to the <a href='https://bgas-kalender.at/login'>website</a> using the following credentials and change your password for security reasons:</p>email: ${existingContact.email || ""}<br>password: ${password}<br><p>Thank you for choosing our services.</p><p>Best Regards,</p><img src='https://firebasestorage.googleapis.com/v0/b/b-gas-13308.appspot.com/o/bgas-logo.png?alt=media&token=7ebf87ca-c995-4266-b660-a4c354460ace' alt='Company Signature Logo' width='150'>`
      getService().emailService.sendMail({
        to: existingContact.email,
        subject: "B-Gas Account Update",
        text: email,
      });
    
      res.status(200).json({ messege: "Contact has been updated and email has been sent" });
    } else {
      res.status(404).json({ messege: "Contact not found" });
    }
  }
}

export default ContactsControllers;
