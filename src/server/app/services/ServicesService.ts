import { UserDaoMongo, User } from "../../../database-client";
import { getEnv } from "../../env";
import { ClientError } from "../../utils/exceptions";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret_key = getEnv().jwt_secret_key;
const jwt_refresh_secret_key = getEnv().jwt_refresh_secret_key;

export class ServicesService {
  constructor(private userDao: UserDaoMongo) {}

  async signupUser(user: User) {
    const userByEmail = await this.userDao
      .getUserByEmail(user.email)
      .then((data) => {
        return data;
      })
      .catch((err) => null);

    if (userByEmail && userByEmail._id) {
      throw new ClientError("Email already exists", 409);
    }

    return this.userDao.addUser(user);
  }

  async login(email: string, password: string) {
    const userByEmail = await this.userDao
      .getUserByEmail(email)
      .then((data) => {
        return data;
      })
      .catch((err) => null);

    if (userByEmail && userByEmail._id) {
      const passwordMatch = await bcrypt.compare(
        password,
        userByEmail.password
      );

      if (passwordMatch) {
        const token = jwt.sign({ userId: userByEmail._id }, jwt_secret_key, {
          expiresIn: "8h",
        });
        const refreshToken = jwt.sign(
          { userId: userByEmail._id },
          jwt_refresh_secret_key,
          { expiresIn: "7d" }
        );

        const user = {
          // @ts-ignore
          ...userByEmail._doc,
          token,
          refreshToken,
        };

        return user;
      } else {
        throw new ClientError("Invalid password", 400);
      }
    } else {
      throw new ClientError("Email not found", 400);
    }
  }

  async verifyIdToken(token: string) {
    try {
      const decodedToken = jwt.verify(token, jwt_secret_key);

      return decodedToken;
    } catch (error) {
      throw new ClientError("Unauthorized", 401);
    }
  }
}
