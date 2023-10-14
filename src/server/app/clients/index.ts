import { UserDaoMongo } from "../../../database-client";
import { CategoryDaoMongo } from "../../../database-client";

import { getMongo } from "./mongodb/mongo";
import { AuthService } from '../user/UserService';
import { CategoryService } from '../category/CategoriesService';

export interface ServiceContainer {
  authService: AuthService;
  categoryService: CategoryService;
}

const createContainer = () => {
  const userDao = new UserDaoMongo(getMongo());
  const categoryDao = new CategoryDaoMongo(getMongo());
  

  const authService = new AuthService(
      userDao
  );

  const categoryService = new CategoryService(
    categoryDao
);

  const container: ServiceContainer = {
    authService,
    categoryService,
  };
  return container;
};

const service = createContainer();

export const getService = () => {
  return service;
};
