import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import xlsx from "xlsx";
import { getService } from "../clients";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const excelFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

var excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var excelUploads = multer({ storage: excelStorage, fileFilter: excelFilter });

export const configure = (app: express.Router) => {
  app.post(
    "/files/upload",
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        const file = req.files?.file;
        const bucket = admin.storage().bucket("gs://b-gas-13308.appspot.com");
        const fileBuffer = file.data;
        const fileName = file.name;
        const fileRef = bucket.file(`services/${fileName}`);
        await fileRef.save(fileBuffer, { contentType: file.mimetype });
        const fileLink = await fileRef.getSignedUrl({
          version: "v2",
          action: "read",
          expires: new Date(3000, 0, 1),
        });

        if (fileLink && fileLink.length) {
          res.json({
            message: "File uploaded successfully",
            link: fileLink[0].replace(
              "https://storage.googleapis.com/b-gas-13308.appspot.com/",
              ""
            ),
          });
        } else {
          res.status(500).json({ message: "Error uploading the file." });
        }
      } catch (error) {
        res.status(500).json({ message: "Error uploading the file." });
      }
    }
  );

  app.get("/files/download/:filename", async (req, res) => {
    try {
      const downloadFileName = req.params.filename;
      const options = {
        destination: downloadFileName,
      };
      const bucket = admin.storage().bucket("gs://b-gas-13308.appspot.com");

      await bucket.file("services/" + downloadFileName).download(options);
      return res.download(downloadFileName);
    } catch (err) {
      res.status(500).json({ message: "Error downloading the file." });
    }
  });

  app.post(
    "/files/import-contacts-file",
    excelUploads.single("file"),
    async (req: any, res: any) => {
      try {
        const file = req.files?.file;
        if (!file) {
          return res.status(400).json({ meesage: "No file uploaded." });
        }

        const workbook = xlsx.read(file.data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const contactsInserted = await insertData(data);
        res.json({
          status: "success",
          message: "successfully imported " + contactsInserted + " contacts",
        });
      } catch (error) {
        res
          .status(500)
          .json({
            status: "error",
            message: "Error inserting the data" + error,
          });
      }
    }
  );

  async function insertData(data: any) {
    let contactsInserted = 0;
    const service = getService();
    const Contact = service.contactService;
    try {
      for (const item of data) {
        let contact = await Contact.getContactByEmail(item.Email || "");
        let contactId = "";

        if (contact && contact._id) {
          contactId = contact._id;
        } else {
          const contact = await Contact.addContact({
            salutation: item.Anrede || "--",
            first_name: item.Vorname || "--",
            last_name: item.Nachname || "--",
            address: item.Adresse || "--",
            zip_code: item.PLZ || "--",
            location: item.Ort || "--",
            telephone: item.Telefon || "--",
            email: item.Email || "--",
            imported: true,
          });
          if (contact && contact._id) {
            contactId = contact._id;
            contactsInserted++;
          }
        }

        const Appointment = service.appointmentService;
        await Appointment.addAppointment({
          category_id: "--",
          service_id: "--",
          calendar_id: "--",
          start_date: item.Datum || "--",
          end_date: item.Datum || "--",
          invoice_number: item.Rechnungsnummer || 0,
          contract_number: item.Kundennummer || 0,
          imported_service_name: item.Leistungen,
          imported_service_duration: item.Dauern,
          imported_service_price: item.Preis,
          contact_id: contactId,
          brand_of_device: item.Brand || "--",
          model: item.Model,
          remarks: item.Beschreibung,
        });
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      return contactsInserted;
    }

    return contactsInserted;
  }

  app.get("/files/export-contacts-file", async (req, res) => {
    try {
      const dataToExport =
        await getService().contactService.getContactsWithAppointments();
      const transformedData: any[] = [];

      dataToExport.map((item: any) => {
        const {
          _id,
          createdAt,
          updatedAt,
          password,
          categories_permission,
          appointments,
          ...rest
        } = item;
        if (appointments.length === 0) {
          transformedData.push(rest);
        } else {
          appointments.map((appointment: any) => {
            const {
              _id,
              createdAt,
              updatedAt,
              contact_id,
              calendar_id,
              service_id,
              category_id,
              control_points,
              ...appointmentInfo
            } = appointment;
            return transformedData.push({ ...rest, ...appointmentInfo });
          });
        }
      });

      const workbook = xlsx.utils.book_new();
      const sheet = xlsx.utils.json_to_sheet(transformedData);

      xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");

      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="exported_data.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buffer);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Error exporting data" });
    }
  });
};
