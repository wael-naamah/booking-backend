import {
  EmailConfigDaoMongo,
  EmailConfig,
  AddEmailConfigRequest,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class EmailService {
  constructor(private emailConfigDao: EmailConfigDaoMongo) {}

  async addEmailConfig(emailConfig: AddEmailConfigRequest) {
    return this.emailConfigDao
      .addEmailConfig(emailConfig)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getEmailConfig() {
    return this.emailConfigDao
      .getEmailConfig()
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateEmailConfig(id: string, newConfig: EmailConfig) {
    return this.emailConfigDao
      .updateEmailConfig(id, newConfig)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async deleteEmailConfig(id: string) {
    return this.emailConfigDao
      .deleteEmailConfig(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }
}
