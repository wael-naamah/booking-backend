import cron from "node-cron";
// import { exec } from "child_process";
// import { getEnv } from "../env";
import { getMongo } from "./clients/mongodb/mongo";
 
// Function to perform database backup
// export const backupDatabase = async () => {
//   console.info("Backup started...");

//   // Exclude archived contacts and appointments collections
//   const excludeArchivedContacts = "--excludeCollection=contacts.archived";
//   const excludeArchivedAppointments = "--excludeCollection=appointments.archived";

//   const backupCommand = `mongodump --uri="mongodb://${getEnv().mongoUsername}:${
//     getEnv().mongoPassword
//   }@${getEnv().mongoHost}:${getEnv().mongoPort}/${
//     getEnv().database
//   }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" ${excludeArchivedContacts} ${excludeArchivedAppointments} --archive | mongorestore --uri="mongodb://${
//     getEnv().mongoUsername
//   }:${getEnv().mongoPassword}@${getEnv().mongoHost}:${getEnv().mongoPort}/${
//     getEnv().database_kalendar
//   }?directconnection=true&authSource=admin&replicaSet=replicaset&retryWrites=true" --archive --drop`;

//   console.log(backupCommand);

//   exec(backupCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Database backup error: ${error}`);
//     }
//     console.log(`Database backup stderr: ${stderr}`);
//   }).on("exit", (code) => {
//     if (code === 0) {
//       console.info("Backup completed successfully.");
//     } else {
//       console.error(`Backup failed with code ${code}`);
//     }
//   });
// };

export const backupDatabase = async (): Promise<void> => {
  const sourceConnection = getMongo();
  const targetConnection = getMongo(true);

  const collections = await sourceConnection.db.listCollections().toArray();

  for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      if (collectionName === 'contacts' || collectionName === 'appointments') {
          const sourceCollection = sourceConnection.collection(collectionName);
          const targetCollection = targetConnection.collection(collectionName);

          // Clear the target collection
          await targetCollection.deleteMany({});

          // Copy non-archived documents
          const cursor = sourceCollection.find({ archived: { $ne: true } });
          
          while (await cursor.hasNext()) {
              const doc = await cursor.next();
              if (doc) {
                  await targetCollection.insertOne(doc);
              }
          }
      } else {
          // For other collections, copy all documents
          const sourceCollection = sourceConnection.collection(collectionName);
          const targetCollection = targetConnection.collection(collectionName);

          // Clear the target collection
          await targetCollection.deleteMany({});

          // Copy all documents
          await targetCollection.insertMany(await sourceCollection.find({}).toArray());
      }
  }

  console.log('Database backup completed successfully.');
};

// Schedule the backup job to run every day at midnight
export default function dbbackup() {
  cron.schedule("0 0 * * *", () => {
    console.log("Running daily database backup...");
    backupDatabase();
  });
}
