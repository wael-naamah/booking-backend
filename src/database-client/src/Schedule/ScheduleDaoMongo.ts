import { schema } from "./ScheduleSchema";
import { Model, Document, Connection } from "mongoose";
import { ExtendedSchedule, Schedule, ScheduleType, WeekDay } from "../Schema";
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

  async getSchedules(page: number, limit: number): Promise<Schedule[]> {
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

  async getScheduleByDate(date: Date): Promise<ExtendedSchedule[]> {
    const schedules = await this.model.aggregate([
      {
        $match: {
          $or: [
            {
              working_hours_type: ScheduleType.Weekly,
              weekday: WeekDay[date.toLocaleDateString('en-US', { weekday: 'long' }) as WeekDay],
            },
            {
              working_hours_type: ScheduleType.Certain,
              date_from: { $lte: date },
              date_to: { $gte: date },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'calendars',
          localField: 'calendar_id',
          foreignField: '_id',
          as: 'calendar',
        },
      },
      {
        $unwind: '$calendar',
      },
      {
        $project: {
          _id: 1,
          time_from: "$time_from",
          time_to: "$time_to",
          calendar_id: 1,
          working_hours_type: "$working_hours_type",
          restricted_to_services: "$restricted_to_services",
          weekday: "$weekday",
          employee_name: '$calendar.employee_name',
          active: '$calendar.active',
        },
      },
      {
        $match: {
          $or: [
            { 'calendar.active': true },
            { 'active': true },
          ]
        }
      }
    ]);
    
    return schedules as unknown as ExtendedSchedule[];
  }
}
