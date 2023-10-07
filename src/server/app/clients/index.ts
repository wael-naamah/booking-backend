import { UserDaoMongo } from "../../../database-client";

import { getMongo } from "./mongodb/mongo";
import { AuthService } from '../user/UserService';

export interface ServiceContainer {
  authService: AuthService;
}

const createContainer = () => {
  const userDao = new UserDaoMongo(getMongo());

  const authService = new AuthService(
      userDao
  );

  const container: ServiceContainer = {
    authService,
  };
  return container;
};

const service = createContainer();

export const getService = () => {
  return service;
};
