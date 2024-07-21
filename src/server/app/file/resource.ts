import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import xlsx from "xlsx";
import { getService } from "../clients";
import { AppointmentStatus } from "../../../database-client";
const ObjectId = require('mongodb').ObjectId;

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

  app.get("/files/download/:path/:filename", async (req, res) => {
    try {
      const downloadFileName = req.params.filename;
      const downloadFilePath = req.params.path;
      const options = {
        destination: downloadFileName,
      };
      const bucket = admin.storage().bucket("gs://b-gas-13308.appspot.com");

      await bucket.file(downloadFilePath + '/' + downloadFileName).download(options);
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
        const data = xlsx.utils.sheet_to_json(sheet, {
          raw: true,
          dateNF: 'MM/DD/YYYY h:mm:ss A',
        });
        const result = await insertData(data);
        res.json({
          status: "success",
          message: "successfully imported " + result?.contactsInserted + " contacts and " + result?.appointmentInserted + " appointments.",
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

  const EXCEL_START_DATE = new Date(Date.UTC(1899, 11, 30));
  function excelSerialNumberToDate(serial: number) {
    const milliseconds = (serial - 1) * 24 * 60 * 60 * 1000;
    const leapYearAdjustment = milliseconds < 0 ? 0 : 1;
    return new Date(EXCEL_START_DATE.getTime() + milliseconds + leapYearAdjustment * 24 * 60 * 60 * 1000);
  }

  async function insertData(data: any) {
    let contactsInserted = 0;
    let appointmentInserted = 0;
    const service = getService();
    const Contact = service.contactService;
    try {
      for (const item of data) {
        let contact = await Contact.getContactByEmail(item.Email || item.email || "");
        let contactId = "";

        if (contact && contact._id) {
          contactId = contact._id;
        } else {
          const contact = await Contact.addContact({
            salutation: item.Anrede || item.salutation || "--",
            first_name: item.Vorname || item.first_name || "--",
            last_name: item.Nachname || item.last_name || "--",
            address: item.Adresse || item.address || "--",
            zip_code: item.PLZ || item.zip_code || "--",
            location: item.Ort || item.location || "--",
            telephone: item.Telefon || item.telephone || "--",
            email: item.Email || item.email || "--",
            imported: true,
          });
          if (contact && contact._id) {
            contactId = contact._id;
            contactsInserted++;
          }
        }

        const Appointment = service.appointmentService;
        let shouldInsertAppointment = true;
        let existingAppointment = await Appointment.getAppointmentById(item.appointment_id || "");
        if (existingAppointment && existingAppointment._id) {
          shouldInsertAppointment = false;
        }
        if (!item.Datum && !item.start_date && !item.end_date) {
          shouldInsertAppointment = false;
        }

        if (shouldInsertAppointment) {
          const startDate = item.Datum || item.start_date;
          const endDate = item.Datum || item.end_date;

          await Appointment.addAppointment({
            category_id: "--",
            service_id: "--",
            calendar_id: "--",
            start_date: excelSerialNumberToDate(startDate).toISOString(),
            end_date: excelSerialNumberToDate(endDate).toISOString(),
            invoice_number: item.Rechnungsnummer || item.invoice_number || 0,
            contract_number: item.Kundennummer || item.contract_number || 0,
            imported_service_name: item.Leistunngen || item.service || "--",
            imported_service_duration: item.Dauern || item.duration || 0,
            imported_service_price: item.Preis || item.price || 0,
            contact_id: contactId,
            brand_of_device: item.Brand || item.brand_of_device || undefined,
            model: item.Model || item.model || undefined,
            remarks: item.Beschreibung || item.remarks || undefined,
            exhaust_gas_measurement: item.Abgasuntersuchung || item.exhaust_gas_measurement || undefined,
            has_maintenance_agreement: item.Wartungsvertrag || item.has_maintenance_agreement || undefined,
            year: item.Jahr || item.year || undefined,
            employee_remarks: item.Mitarbeiterbemerkungen || item.employee_remarks || undefined,
            company_remarks: item.Firmenbemerkungen || item.company_remarks || undefined,
            appointment_status: item.Status || item.appointment_status || AppointmentStatus.Confirmed,
            ended_at: item.Abgelaufen || item.ended_at || undefined,
            created_by: item.ErstelltVon || item.created_by || undefined,
          });
          appointmentInserted++;
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      return {contactsInserted, appointmentInserted};
    }

    return {contactsInserted, appointmentInserted};
  }

  app.get("/files/export-contacts-file", async (req, res) => {
    try {
      const dataToExport =
        await getService().contactService.getContactsWithAppointments();
      const transformedData: any[] = [];
      const services = await getService().categoryService.getServices();
      dataToExport.map((item: any) => {
        const {
          _id,
          createdAt,
          updatedAt,
          password,
          categories_permission,
          appointments,
          contract_link,
          ...rest
        } = item;
        if (appointments.length === 0) {
          transformedData.push(rest);
        } else {
          appointments.map(async (appointment: any) => {
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
            let duration = 0;
            let service = '';
            let price = 0;

            if (category_id && service_id) {
              const serviceObjectId = new ObjectId(service_id);
              const servise = (services || []).find((service: any) => service._id.equals(serviceObjectId));
              if (servise) {
                duration = servise.duration;
                service = servise.name;
                price = servise.price;
              }
            }
            let contractLink = '';
            if (contract_link) {
            contractLink = `https://storage.googleapis.com/b-gas-13308.appspot.com/${contract_link}`;
            }

            return transformedData.push({ ...rest, duration, service, price, appointment_id: _id, contract_link: contractLink ? contractLink : '', ...appointmentInfo });
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

  app.post(
    "/files/upload-contract-file",
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        const file = req.files?.file;
        const bucket = admin.storage().bucket("gs://b-gas-13308.appspot.com");
        const fileBuffer = file.data;
        const fileName = file.name;
        const fileRef = bucket.file(`contracts/${fileName}`);
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
};
