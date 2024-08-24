import cron from "node-cron";
import { exec } from "child_process";
import { getEnv } from "../env";

// Function to perform database backup
export const backupDatabase = async () => {
  console.info("Backup started...");
  const sourceDb = getEnv().database;
  const targetDb = getEnv().database_kalendar;

  // Exclude archived contacts and appointments
  const excludeArchivedContacts =
    "--excludeCollection=contacts --excludeCollectionWithPrefix=contacts.archived";
  const excludeArchivedAppointments =
    "--excludeCollection=appointments --excludeCollectionWithPrefix=appointments.archived";

  const backupCommand = `mongodump --uri="mongodb://${getEnv().mongoUsername}:${
    getEnv().mongoPassword
  }@${getEnv().mongoHost}:${getEnv().mongoPort}/${
    getEnv().database
  }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" --db=${sourceDb} ${excludeArchivedContacts} ${excludeArchivedAppointments} --archive | mongorestore --uri="mongodb://${
    getEnv().mongoUsername
  }:${getEnv().mongoPassword}@${getEnv().mongoHost}:${getEnv().mongoPort}/${
    getEnv().database
  }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" --db=${targetDb} --archive --drop`;
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
