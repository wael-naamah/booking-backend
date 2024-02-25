import { Contact } from "../Schema";

export interface ContactDao {
  getContacts(
    page: number,
    limit: number,
    search?: string
  ): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  addContact(contact: Partial<Contact>): Promise<Contact>;
  updateContact(id: string, newContact: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<Contact | null>;
  getContactsWithAppointments(): Promise<any>;
}
