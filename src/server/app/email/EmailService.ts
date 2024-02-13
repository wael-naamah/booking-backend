import {
  EmailConfigDaoMongo,
  EmailConfig,
  AddEmailConfigRequest,
  EmailTemplateDaoMongo,
  EmailTemplate,
  AddEmailTemplateRequest,
  EmailTemplateType,
  SendEmailForm
} from "../../../database-client";
import { decrypt } from "../../utils/encryption";
import { ClientError } from "../../utils/exceptions";
import nodemailer from "nodemailer";
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

  async getEmailTemplatesByServiceId(id: string) {
    return this.emailTemplateDao
      .getEmailTemplatesByServiceId(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async sendMail(form: SendEmailForm) {
    try{
    const mailConfig = await this.getEmailConfig();

      if (mailConfig && mailConfig.length) {
        const { sender, server, username, password, port, ssl_enabled } =
          mailConfig[0];
        const decryptedPassword = decrypt(password)

        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: server,
          port: port,
          secure: ssl_enabled,
          auth: {
            user: username,
            pass: decryptedPassword,
          },
        });

        // Define email options
        const mailOptions = {
          from: sender,
          to: form.to,
          subject: form.subject,
          html: form.text,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

       return info;
      } else {
        throw new ClientError("Email service is not configured", 500);
      }
    } catch (err){
      console.error('err', err)
      throw new ClientError("Something went wrong. please try again later.", 500);
    }
  }
}
