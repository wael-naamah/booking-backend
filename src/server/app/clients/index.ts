import {
  UserDaoMongo,
  CategoryDaoMongo,
  AppointmentDaoMongo,
} from "../../../database-client";

import { getMongo } from "./mongodb/mongo";
import { AuthService } from "../user/UserService";
import { CategoryService } from "../category/CategoriesService";
import { AppointmentsService } from "../appointment/AppointmentsService";

export interface ServiceContainer {
  authService: AuthService;
  categoryService: CategoryService;
  appointmentService: AppointmentsService;
}

const createContainer = () => {
  const userDao = new UserDaoMongo(getMongo());
  const categoryDao = new CategoryDaoMongo(getMongo());
  const appointmentDao = new AppointmentDaoMongo(getMongo());

  const authService = new AuthService(userDao);

  const categoryService = new CategoryService(categoryDao);

  const appointmentService = new AppointmentsService(appointmentDao, categoryDao);

  const container: ServiceContainer = {
    authService,
    categoryService,
    appointmentService,
  };
  return container;
};

const service = createContainer();

export const getService = () => {
  return service;
};
