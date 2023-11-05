import { schema } from "./CalendarSchema";
import { Model, Document, Connection } from "mongoose";
import { Calendar } from "../Schema";
import { CalendarDao } from "./CalendarDao";
import { isEmptyObject } from "../utils";

export class CalendarDaoMongo implements CalendarDao {
  model: Model<Document<Calendar>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Calendar>>("Calendars", schema);
  }

  async addCalendar(calendar: Partial<Calendar>): Promise<Calendar> {
    const newCalendar = new this.model(calendar);
    return newCalendar.save().then((res) => {
      return res as unknown as Calendar;
    });
  }

  async getCalendarById(id: string): Promise<Calendar | null> {
    return this.model.findById(id);
  }

  async getCalendarsByIds(ids: string[]): Promise<Calendar[]> {
    const query = {
      _id: { $in: ids }
    };

    return this.model.find(query);
  }

  async getActiveCalendarsByIds(ids: string[]): Promise<Calendar[]> {
    const query = {
      _id: { $in: ids },
      active: true
    };

    return this.model.find(query);
  }

  async getCalendars(
    page: number,
    limit: number,
    search?: string
  ): Promise<Calendar[]> {

    let query: any = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { employee_name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ].filter((el) => !isEmptyObject(el)),
      };
    }

    return this.model
      .find(query)
      .limit(limit)
      .skip(limit * (page - 1))
      .then((data) => data as unknown as Calendar[]);
  }

  async getCalendarsCount(search?: string): Promise<number> {

    let query: any = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { employee_name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ].filter((el) => !isEmptyObject(el)),
      };
    }

    return this.model.countDocuments(query).then((count) => {
      return count;
    });
  }

  async updateCalendar(id: string, newCalendar: Partial<Calendar>) {
    return this.model
      .findByIdAndUpdate(id, newCalendar, { new: true })
      .then((res) => {
        return res as unknown as Calendar;
      });
  }

  async deleteCalendar(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as Calendar;
    });
  }
}
