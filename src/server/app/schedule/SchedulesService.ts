import {
  ScheduleDaoMongo,
  Schedule,
  AddScheduleRequest,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class SchedulesService {
  constructor(private scheduleDao: ScheduleDaoMongo) {}

  async addSchedule(schedule: AddScheduleRequest) {
    return this.scheduleDao
      .addSchedule(schedule)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while add the schedule",
          500
        );
      });
  }

  async getScheduleById(id: string) {
    return this.scheduleDao
      .getScheduleById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateSchedule(id: string, newSchedule: Schedule) {
    return this.scheduleDao
      .updateSchedule(id, newSchedule)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while update the schedule",
          500
        );
      });
  }

  async getSchedules(page: number, limit: number) {
    const [data, count] = await Promise.all([
      this.scheduleDao.getSchedules(page, limit).then((data) => {
        return data;
      }),
      this.scheduleDao.getSchedulesCount().then((data) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteSchedule(id: string) {
    return this.scheduleDao
      .deleteSchedule(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while delete the schedule",
          500
        );
      });
  }
}
