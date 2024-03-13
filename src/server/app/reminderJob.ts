import cron from "node-cron";
import { getService } from "./clients";

export default function reminderJob() {
  cron.schedule("* * * * *", async () => {
    console.log("Cron job is running every minute.");
    const appointments =
      await getService().appointmentService.getDueReminderAppointments();
    console.log("appointments", appointments);
    appointments.forEach((appointment) => {
      sendReminderEmail(appointment);
    });
  });
}

function sendReminderEmail(appointment: any) {
  console.log("appointment", appointment);
  const formattedStartDate = (
    appointment.start_date || new Date(appointment.imported_service_duration)
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedStartTime = (
    appointment.start_date || new Date(appointment.imported_service_duration)
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedEndTime = (
    appointment.end_date || new Date(appointment.imported_service_duration)
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const emailSubject = `Appointment Reminder: ${
    appointment.service?.name || appointment?.imported_service_name || ""
  } ${appointment?.brand_of_device || ""} ${
    appointment.model
  } - ${formattedStartDate}, from ${formattedStartTime} to ${formattedEndTime}`;

  getService().emailService.sendMail({
    to: appointment?.contact?.[0]?.email,
    subject: "Appointment Reminder",
    text: emailSubject,
  });
}

export function testCronJob() {
  cron.schedule("0 0 * * *", () => {
    // Log a message
    console.log("Cron job is running every day.");
  });
}
