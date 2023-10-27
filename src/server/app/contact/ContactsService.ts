import {
  ContactDaoMongo,
  Contact,
  AddContactRequest,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class ContactsService {
  constructor(private contactDao: ContactDaoMongo) {}

  async addContact(contact: AddContactRequest) {
    return this.contactDao
      .addContact(contact)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while add the contact",
          500
        );
      });
  }

  async getContactById(id: string) {
    return this.contactDao
      .getContactById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateContact(id: string, newContact: Contact) {
    return this.contactDao
      .updateContact(id, newContact)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while update the contact",
          500
        );
      });
  }

  async getContacts(page: number, limit: number, search?: string) {
    const [data, count] = await Promise.all([
      this.contactDao.getContacts(page, limit, search).then((data) => {
        return data;
      }),
      this.contactDao.getContactsCount(search).then((data) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteContact(id: string) {
    return this.contactDao
      .deleteContact(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while delete the contact",
          500
        );
      });
  }
}
