export enum Salutation {
  WOMAN = "woman",
  MISTER = "mister",
  COMPANY = "company",
}

export interface Appointment {
  _id?: string;
  service_abbreviation_id: number;
  start_date: Date;
  end_date: Date;
  assign_to?: string;
  salutation: Salutation;
  first_name: string;
  last_name: string;
  address: string;
  zip_code: string;
  location: string;
  telephone: string;
  email: string;
  brand_of_device?: string;
  model?: string;
  exhaust_gas_measurement?: boolean;
  has_maintenance_agreement?: boolean;
  has_bgas_before?: boolean;
  year?: string;
  remarks?: string;
  attachment?: string;
  remember_entries?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentForm {
  start: Date;
  end: Date;
  search?: string;
}

export interface AddAppointmentRequest
  extends Omit<
    Appointment,
    "_id" | "service_abbreviation_id" | "createdAt" | "updatedAt"
  > {
  category_id: string;
  service_id: string;
}
