import { schema } from "./EmailTemplateSchema";
import { Model, Document, Connection } from "mongoose";
import { EmailTemplate } from "../Schema";
import { EmailTemplateDao } from "./EmailTemplateDao";

export class EmailTemplateDaoMongo implements EmailTemplateDao {
  model: Model<Document<EmailTemplate>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<EmailTemplate>>("email_templates", schema);
  }

  async addEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const newTemplate = new this.model(template);
    return newTemplate.save().then((res) => {
      return res as unknown as EmailTemplate;
    });
  }

  async getEmailTemplates(type: string): Promise<EmailTemplate[]> {
    return this.model.find({type: type}) as unknown as EmailTemplate[];
  }

  async updateEmailTemplate(id: string, newTemplate: Partial<EmailTemplate>) {
    return this.model
      .findByIdAndUpdate(id, newTemplate, { new: true })
      .then((res) => {
        return res as unknown as EmailTemplate;
      });
  }

  async deleteEmailTemplate(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as EmailTemplate;
    });
  }

  async getEmailTemplatesByServiceId(serviceId: string): Promise<EmailTemplate | null> {
    return this.model.findOne({service_id: serviceId}) as unknown as EmailTemplate;
  }
}
