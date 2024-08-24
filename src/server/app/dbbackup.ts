import cron from "node-cron";
import { exec } from "child_process";
import { getEnv } from "../env";

// Function to perform database backup
export const backupDatabase = async () => {
  console.info("Backup started...");

  // Exclude archived contacts and appointments collections
  const excludeArchivedContacts = "--excludeCollection=contacts.archived";
  const excludeArchivedAppointments = "--excludeCollection=appointments.archived";

  const backupCommand = `mongodump --uri="mongodb://${getEnv().mongoUsername}:${
    getEnv().mongoPassword
  }@${getEnv().mongoHost}:${getEnv().mongoPort}/${
    getEnv().database
  }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" ${excludeArchivedContacts} ${excludeArchivedAppointments} --archive | mongorestore --uri="mongodb://${
    getEnv().mongoUsername
  }:${getEnv().mongoPassword}@${getEnv().mongoHost}:${getEnv().mongoPort}/${
    getEnv().database_kalendar
  }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" --archive --drop`;

  console.log(backupCommand);

  exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Database backup error: ${error}`);
    }
    console.log(`Database backup stderr: ${stderr}`);
  }).on("exit", (code) => {
    if (code === 0) {
      console.info("Backup completed successfully.");
    } else {
      console.error(`Backup failed with code ${code}`);
    }
  });
};

// Schedule the backup job to run every day at midnight
export default function dbbackup() {
  cron.schedule("0 0 * * *", () => {
    console.log("Running daily database backup...");
    backupDatabase();
  });
}
