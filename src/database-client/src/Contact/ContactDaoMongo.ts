import { schema } from "./ContactSchema";
import { Model, Document, Connection } from "mongoose";
import { Contact } from "../Schema";
import { ContactDao } from "./ContactDao";
import { isEmptyObject, isValidNumber } from "../utils";

export class ContactDaoMongo implements ContactDao {
  model: Model<Document<Contact>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Contact>>("Contacts", schema);
  }

  async addContact(contact: Partial<Contact>): Promise<Contact> {
    const newContact = new this.model(contact);
    return newContact.save().then((res) => {
      return res as unknown as Contact;
    });
  }

  async getContactById(id: string): Promise<Contact | null> {
    return this.model.findById(id);
  }

  async getContactByEmail(email: string): Promise<Contact | null> {
    return this.model.findOne({email});
  }

  async getContacts(
    page: number,
    limit: number,
    search?: string
  ): Promise<Contact[]> {
    const isValidNo = isValidNumber(search);

    let query: any = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { telephone: { $regex: search, $options: "i" } },
          { phone_numbber_2: { $regex: search, $options: "i" } },
          { phone_numbber_3: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { note_on_address: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          { remarks: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          { password: { $regex: search, $options: "i" } },
          isValidNo ? { service_abbreviation_id: Number(search) } : {},
        ].filter((el) => !isEmptyObject(el)),
      };
    }

    return this.model
      .find(query)
      .limit(limit)
      .skip(limit * (page - 1))
      .then((data) => data as unknown as Contact[]);
  }

  async getContactsWithAppointments(): Promise<any> {
    return this.model.aggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "contact_id",
          as: "appointments",
        },
      },
    ]);
  }

  async getContactsCount(search?: string): Promise<number> {
    const isValidNo = isValidNumber(search);

    let query: any = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { telephone: { $regex: search, $options: "i" } },
          { phone_numbber_2: { $regex: search, $options: "i" } },
          { phone_numbber_3: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { note_on_address: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          { remarks: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          isValidNo ? { service_abbreviation_id: Number(search) } : {},
        ].filter((el) => !isEmptyObject(el)),
      };
    }

    return this.model.countDocuments(query).then((count) => {
      return count;
    });
  }

  async updateContact(id: string, newContact: Partial<Contact>) {
    return this.model
      .findByIdAndUpdate(id, newContact, { new: true })
      .then((res) => {
        return res as unknown as Contact;
      });
  }

  async deleteContact(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as Contact;
    });
  }
}
