export enum WeekDay {
  Monday = "monday",
  Tuesday = "tuesday",
  Wednesday = "wednesday",
  Thursday = "thursday",
  Friday = "friday",
  Saturday = "saturday",
  Sunday = "sunday",
}

export enum ScheduleType {
  Weekly = "weekly",
  Certain = "certain",
}

export interface Schedule {
  _id?: string;
  calendar_id: string;
  working_hours_type: ScheduleType;
  day: WeekDay | Date;
  time_from: string;
  time_to: string;
  reason?: string;
  deactivate_working_hours?: boolean;
  one_time_appointment_link?: string;
  only_internally?: boolean;
  restricted_to_services?: string[];
  possible_appointment?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddScheduleRequest extends Omit<Schedule, "_id" | "createdAt" | "updatedAt"> {}
