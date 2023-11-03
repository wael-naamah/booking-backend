import { schema } from "./ScheduleSchema";
import { Model, Document, Connection } from "mongoose";
import { Schedule } from "../Schema";
import { ScheduleDao } from "./ScheduleDao";

export class ScheduleDaoMongo implements ScheduleDao {
  model: Model<Document<Schedule>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Schedule>>("Schedules", schema);
  }

  async addSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    const newSchedule = new this.model(schedule);
    return newSchedule.save().then((res) => {
      return res as unknown as Schedule;
    });
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    return this.model.findById(id);
  }

  async getSchedules(
    page: number,
    limit: number,
  ): Promise<Schedule[]> {
    return this.model
      .find()
      .limit(limit)
      .skip(limit * (page - 1))
      .then((data) => data as unknown as Schedule[]);
  }

  async getSchedulesCount(): Promise<number> {
    return this.model.countDocuments().then((count) => {
      return count;
    });
  }

  async updateSchedule(id: string, newSchedule: Partial<Schedule>) {
    return this.model
      .findByIdAndUpdate(id, newSchedule, { new: true })
      .then((res) => {
        return res as unknown as Schedule;
      });
  }

  async deleteSchedule(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as Schedule;
    });
  }
}
