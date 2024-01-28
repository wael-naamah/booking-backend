import {
  UserDaoMongo,
  CategoryDaoMongo,
  AppointmentDaoMongo,
  ContactDaoMongo,
  CalendarDaoMongo,
  ScheduleDaoMongo,
  EmailConfigDaoMongo,
  EmailTemplateDaoMongo
} from "../../../database-client";

import { getMongo } from "./mongodb/mongo";
import { AuthService } from "../user/UserService";
import { CategoryService } from "../category/CategoriesService";
import { AppointmentsService } from "../appointment/AppointmentsService";
import { ContactsService } from "../contact/ContactsService";
import { CalendarsService } from "../calendar/CalendarsService";
import { SchedulesService } from "../schedule/SchedulesService";
import { EmailService } from "../email/EmailService";

export interface ServiceContainer {
  authService: AuthService;
  categoryService: CategoryService;
  appointmentService: AppointmentsService;
  contactService: ContactsService;
  calendarService: CalendarsService;
  scheduleService: SchedulesService;
  emailService: EmailService;
}

const createContainer = () => {
  const userDao = new UserDaoMongo(getMongo());
  const categoryDao = new CategoryDaoMongo(getMongo());
  const appointmentDao = new AppointmentDaoMongo(getMongo());
  const contactDao = new ContactDaoMongo(getMongo());
  const calendarDao = new CalendarDaoMongo(getMongo());
  const scheduleDao = new ScheduleDaoMongo(getMongo());
  const emailConfigDao = new EmailConfigDaoMongo(getMongo());
  const emailTemplateDao = new EmailTemplateDaoMongo(getMongo());


  const authService = new AuthService(userDao);

  const categoryService = new CategoryService(categoryDao);
  const calendarService = new CalendarsService(calendarDao);
  const scheduleService = new SchedulesService(scheduleDao);
  const emailService = new EmailService(emailConfigDao, emailTemplateDao);

  

  const appointmentService = new AppointmentsService(
    appointmentDao,
    categoryDao,
    scheduleDao
  );
  const contactService = new ContactsService(contactDao);

  const container: ServiceContainer = {
    authService,
    categoryService,
    appointmentService,
    contactService,
    calendarService,
    scheduleService,
    emailService
  };
  return container;
};

const service = createContainer();

export const getService = () => {
  return service;
};
