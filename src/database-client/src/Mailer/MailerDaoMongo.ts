import { schema } from "./MailerSchema";
import { Model, Document, Connection } from "mongoose";
import { EmailConfig } from "../Schema";
import { EmailConfigDao } from "./MailerDao";

export class EmailConfigDaoMongo implements EmailConfigDao {
  model: Model<Document<EmailConfig>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<EmailConfig>>("mailer", schema);
  }

  async addEmailConfig(config: Partial<EmailConfig>): Promise<EmailConfig> {
    const newConfig = new this.model(config);
    return newConfig.save().then((res) => {
      return res as unknown as EmailConfig;
    });
  }

  async getEmailConfig(): Promise<EmailConfig[]> {
    return this.model.find().sort({_id:1}) as unknown as EmailConfig[];
  }

  async updateEmailConfig(id: string, newConfig: Partial<EmailConfig>) {
    return this.model
      .findByIdAndUpdate(id, newConfig, { new: true })
      .then((res) => {
        return res as unknown as EmailConfig;
      });
  }

  async deleteEmailConfig(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as EmailConfig;
    });
  }
}
