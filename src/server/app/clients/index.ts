import {
  UserDaoMongo,
  CategoryDaoMongo,
  AppointmentDaoMongo,
  ContactDaoMongo,
} from "../../../database-client";

import { getMongo } from "./mongodb/mongo";
import { AuthService } from "../user/UserService";
import { CategoryService } from "../category/CategoriesService";
import { AppointmentsService } from "../appointment/AppointmentsService";
import { ContactsService } from "../contact/ContactsService";

export interface ServiceContainer {
  authService: AuthService;
  categoryService: CategoryService;
  appointmentService: AppointmentsService;
  contactService: ContactsService;
}

const createContainer = () => {
  const userDao = new UserDaoMongo(getMongo());
  const categoryDao = new CategoryDaoMongo(getMongo());
  const appointmentDao = new AppointmentDaoMongo(getMongo());
  const contactDao = new ContactDaoMongo(getMongo());

  const authService = new AuthService(userDao);

  const categoryService = new CategoryService(categoryDao);

  const appointmentService = new AppointmentsService(
    appointmentDao,
    categoryDao
  );
  const contactService = new ContactsService(contactDao);

  const container: ServiceContainer = {
    authService,
    categoryService,
    appointmentService,
    contactService,
  };
  return container;
};

const service = createContainer();

export const getService = () => {
  return service;
};
