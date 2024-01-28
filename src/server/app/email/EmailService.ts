import {
  EmailConfigDaoMongo,
  EmailConfig,
  AddEmailConfigRequest,
  EmailTemplateDaoMongo,
  EmailTemplate,
  AddEmailTemplateRequest,
  EmailTemplateType
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class EmailService {
  constructor(private emailConfigDao: EmailConfigDaoMongo, private emailTemplateDao: EmailTemplateDaoMongo) {}

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

  async addEmailTemplate(emailTemplate: AddEmailTemplateRequest) {
    return this.emailTemplateDao
      .addEmailTemplate(emailTemplate)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getEmailTemplates(type: EmailTemplateType) {
    return this.emailTemplateDao
      .getEmailTemplates(type)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateEmailTemplate(id: string, newTemplate: EmailTemplate) {
    return this.emailTemplateDao
      .updateEmailTemplate(id, newTemplate)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async deleteEmailTemplate(id: string) {
    return this.emailTemplateDao
      .deleteEmailTemplate(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }
}
