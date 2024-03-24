import {
  UserDaoMongo,
  User,
  ContactDaoMongo,
  CalendarDaoMongo,
  ResetPasswordForm,
} from "../../../database-client";
import { getEnv } from "../../env";
import { ClientError } from "../../utils/exceptions";
import { getService } from "../clients";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret_key = getEnv().jwt_secret_key;
const jwt_refresh_secret_key = getEnv().jwt_refresh_secret_key;

export class AuthService {
  constructor(
    private userDao: UserDaoMongo,
    private contactDao: ContactDaoMongo,
    private calendarDao: CalendarDaoMongo
  ) {}

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
          role: "user",
        };

        return user;
      } else {
        throw new ClientError("Invalid password", 400);
      }
    } else {
      const userByEmail = await this.calendarDao
        .getCalendarByEmail(email)
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
            role: "calendar",
          };

          return user;
        } else {
          throw new ClientError("Invalid password", 400);
        }
      } else {
        const userByEmail = await this.contactDao
          .getContactByEmail(email)
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
            const token = jwt.sign(
              { userId: userByEmail._id },
              jwt_secret_key,
              {
                expiresIn: "8h",
              }
            );
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
              role: "contact",
            };

            return user;
          } else {
            throw new ClientError("Invalid password", 400);
          }
        } else {
          throw new ClientError("Email not found", 400);
        }
      }
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

  async refreshToken(refreshToken: string) {
    try {
      const decodedToken = jwt.verify(refreshToken, jwt_refresh_secret_key);

      if (decodedToken) {
        const token = jwt.sign(
          { userId: decodedToken.userId },
          jwt_secret_key,
          {
            expiresIn: "8h",
          }
        );
        const refreshToken = jwt.sign(
          { userId: decodedToken.userId },
          jwt_refresh_secret_key,
          { expiresIn: "7d" }
        );

        const newTokens = {
          token,
          refreshToken,
        };

        return newTokens;
      }

      return decodedToken;
    } catch (error) {
      throw new ClientError("Unauthorized", 401);
    }
  }

  async resetPassword(form: ResetPasswordForm) {
    const userByEmail = await this.contactDao
      .getContactByEmail(form.email)
      .then((data) => {
        return data;
      })
      .catch((err) => null);

    if (userByEmail && userByEmail._id) {
      const passwordMatch = await bcrypt.compare(
        form.oldPassword,
        userByEmail.password
      );

      if (passwordMatch) {
        const contact = {
          // @ts-ignore
          ...userByEmail._doc,
          password: form.password,
        };

        const data = await this.contactDao.updateContact(
          userByEmail._id,
          contact
        );

        // @ts-ignore
        if (data) data.password = undefined;

        return data;
      } else {
        throw new ClientError("Invalid password", 400);
      }
    } else {
      throw new ClientError("User not found", 400);
    }
  }

  async forgotPassword(email: string) {
    const userByEmail = await this.contactDao
      .getContactByEmail(email)
      .then((data) => {
        return data;
      })
      .catch((err) => null);

    if (userByEmail && userByEmail._id) {
      const token = jwt.sign({ userId: userByEmail._id }, jwt_secret_key, {
        expiresIn: "1h",
      });

      const resetLink = `https://bgas-kalender.at/reset-password/${token}`;

      await this.userDao.addToken(token, email);

      getService().emailService.sendMail({
        to: email,
        subject: "Reset your password",
        text: `To reset your password, please click the following link: ${resetLink}`,
      });

      return {
        code: 200,
        message: "Reset link sent to your email",
      };
    } else {
      throw new ClientError("User not found", 400);
    }
  }

  async resetContactPassword(token: string, password: string) {
    const tokenData = await this.userDao
      .getToken(token)
      .then((data) => {
        return data;
      })
      .catch((err) => null);

    if (tokenData) {
      // check if token is expired
      const currentTime = new Date().getTime();
      const tokenTime = tokenData.createdAt!.getTime();
      const timeDiff = currentTime - tokenTime;
      const tokenExpired = timeDiff > 3600000;
      if (tokenExpired) {
        throw new ClientError("Token expired", 400);
      }
      const userByEmail = await this.contactDao
        .getContactByEmail(tokenData.email)
        .then((data) => {
          return data;
        })
        .catch((err) => null);

      if (userByEmail && userByEmail._id) {
        const contact = {
          // @ts-ignore
          ...userByEmail._doc,
          password,
        };

        const data = await this.contactDao.updateContact(
          userByEmail._id,
          contact
        );

        // @ts-ignore
        if (data) data.password = undefined;

        await this.userDao.deleteToken(token);

        return data;
      } else {
        throw new ClientError("User not found", 400);
      }
    } else {
      throw new ClientError("Token not found", 400);
    }
  }
}
