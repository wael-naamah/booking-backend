import {
  AppointmentDaoMongo,
  Appointment,
  CategoryDaoMongo,
  AddAppointmentRequest,
  CalendarDaoMongo,
  ScheduleDaoMongo,
  Schedule,
} from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class AppointmentsService {
  constructor(
    private appointmentDao: AppointmentDaoMongo,
    private categoryDao: CategoryDaoMongo,
    private calendarDao: CalendarDaoMongo,
    private scheduleDao: ScheduleDaoMongo
  ) {}

  async addAppointment(appointment: AddAppointmentRequest) {
    return this.appointmentDao
      .addAppointment(appointment)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while add the appointment",
          500
        );
      });
  }

  async getAppointmentById(id: string) {
    return this.appointmentDao
      .getAppointmentById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateAppointment(id: string, newAppointment: AddAppointmentRequest) {
    return this.appointmentDao
      .updateAppointment(id, newAppointment)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while update the appointment",
          500
        );
      });
  }

  async getAppointments(start: Date, end: Date, search?: string) {
    return this.appointmentDao
      .getAppointments(start, end, search)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while fetching appointments",
          500
        );
      });
  }

  async deleteAppointment(id: string) {
    return this.appointmentDao
      .deleteAppointment(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while delete the appointment",
          500
        );
      });
  }

  async getTimeSlots(date: Date, category_id: string, service_id: string) {
    const servise = await this.categoryDao.getServiceByCategoryIdAndServiceId(
      category_id,
      service_id
    );

    if (servise) {
      // @ts-ignore
      const serviseDuration = servise.services[0].duration;

      const schedules = await this.scheduleDao.getScheduleByDate(date);
      if (schedules && schedules.length) {
        const calendarIDs = schedules.map((el) => el.calendar_id);
        const uniqueCalendarIDs = [...new Set(calendarIDs)];
        const activeCalendars = await this.calendarDao.getActiveCalendarsByIds(
          uniqueCalendarIDs
        );

        const activeSchedules = schedules.filter(
          (el) =>
            el.active &&
            activeCalendars.some((item) => item._id === el.calendar_id)
        );

        const timeSlots = await this.calculateTimeSlots(
          activeSchedules,
          date,
          serviseDuration
        );

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const bookedAppointments = await this.appointmentDao.getAppointments(
          startDate,
          endDate
        );

        const availableTimeSlots =  await this.filterBookedAppointments(timeSlots, bookedAppointments);


        return availableTimeSlots;
      } else {
        return [];
      }
    } else {
      throw new ClientError(
        "Cann't find service with Id " +
          service_id +
          " and category Id" +
          category_id,
        404
      );
    }
  }

  async calculateTimeSlots(
    schedules: Schedule[],
    selectedDate: Date,
    serviceDuration: number
  ) {
    const timeSlots = [];
    const selectedDay = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Filter weekly schedules matching the selected day
    const weeklySchedules = schedules.filter((schedule) => {
      return (
        schedule.working_hours_type === "weekly" &&
        schedule.weekday === selectedDay
      );
    });

    // Filter certain date schedules that encompass the selected date
    const certainDateSchedules = schedules.filter((schedule) => {
      return (
        schedule.working_hours_type === "certain" &&
        schedule.date_from &&
        schedule.date_to &&
        new Date(selectedDate) >= new Date(schedule.date_from) &&
        new Date(selectedDate) <= new Date(schedule.date_to)
      );
    });

    // Calculate available time slots from weekly schedules
    for (const weeklySchedule of weeklySchedules) {
      const startTime = await this.parseTime(weeklySchedule.time_from);
      const endTime = await this.parseTime(weeklySchedule.time_to);

      // Generate time slots based on time range and service duration
      const currentSlot = new Date(selectedDate);
      currentSlot.setUTCHours(startTime.hours, startTime.minutes, 0, 0);

      while (
        currentSlot.getUTCHours() < endTime.hours ||
        (currentSlot.getUTCHours() === endTime.hours &&
          currentSlot.getUTCMinutes() < endTime.minutes)
      ) {
        const slotEndTime = new Date(currentSlot);
        slotEndTime.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );

        if (
          slotEndTime.getUTCHours() < endTime.hours ||
          (slotEndTime.getUTCHours() === endTime.hours &&
            slotEndTime.getUTCMinutes() <= endTime.minutes)
        ) {
          timeSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString(),
            calendar_id: weeklySchedule.calendar_id,
          });
        }

        currentSlot.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );
      }
    }

    // Calculate available time slots from certain date schedules
    for (const certainSchedule of certainDateSchedules) {
      const startTime = await this.parseTime(certainSchedule.time_from);
      const endTime = await this.parseTime(certainSchedule.time_to);

      // Generate time slots based on time range and service duration
      const currentSlot = new Date(selectedDate);
      currentSlot.setUTCHours(startTime.hours, startTime.minutes, 0, 0);

      while (
        currentSlot.getUTCHours() < endTime.hours ||
        (currentSlot.getUTCHours() === endTime.hours &&
          currentSlot.getUTCMinutes() < endTime.minutes)
      ) {
        const slotEndTime = new Date(currentSlot);
        slotEndTime.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );

        if (
          slotEndTime.getUTCHours() < endTime.hours ||
          (slotEndTime.getUTCHours() === endTime.hours &&
            slotEndTime.getUTCMinutes() <= endTime.minutes)
        ) {
          timeSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString(),
            calendar_id: certainSchedule.calendar_id,
          });
        }

        currentSlot.setUTCMinutes(
          currentSlot.getUTCMinutes() + serviceDuration
        );
      }
    }

    return timeSlots;
  }

  async parseTime(time: string) {
    // Split the time string into hours, minutes, and AM/PM
    const parts = time.split(" ");
    let [hours, minutes] = parts[0].split(":").map(Number);
    const isPM = parts[1].toLowerCase() === "pm";

    if (isPM && hours !== 12) {
      hours += 12; // Convert to 24-hour format
    } else if (!isPM && hours === 12) {
      hours = 0; // Midnight in 24-hour format
    }

    return { hours, minutes };
  }

  async filterBookedAppointments(timeSlots: {start: string; end: string; calendar_id: string}[], bookedAppointments: Appointment[]) {
    const availableTimeSlots = [];
  
    for (const timeSlot of timeSlots) {
      let isBooked = false;
  
      for (const appointment of bookedAppointments) {
        const appointmentStart = new Date(appointment.start_date);
        const appointmentEnd = new Date(appointment.end_date);
        const timeSlotStart = new Date(timeSlot.start);
        const timeSlotEnd = new Date(timeSlot.end);
  
        if (
          timeSlotStart < appointmentEnd &&
          timeSlotEnd > appointmentStart
        ) {
          isBooked = true;
          break;
        }
      }
  
      if (!isBooked) {
        availableTimeSlots.push(timeSlot);
      }
    }
  
    return availableTimeSlots;
  }
}
