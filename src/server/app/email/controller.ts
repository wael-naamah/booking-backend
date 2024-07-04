import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import {
  AddEmailConfigRequest,
  AddEmailTemplateRequest,
  EmailConfig,
  EmailTemplate,
  EmailTemplateType,
  SendEmailForm,
} from "../../../database-client/src/Schema";
import nodemailer from "nodemailer";
import { ServiceContainer } from "../clients";
import { decrypt, encrypt } from "../../utils/encryption";
import { PDFDocument } from "pdf-lib";
import fs from "fs";

class EmailControllers {
  @tryCatchErrorDecorator
  static async addEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to add email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddEmailConfigRequest;
    const encryptedPassword = encrypt(form.password);
    const updatedForm = {
      ...form,
      password: encryptedPassword,
    };
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.addEmailConfig(updatedForm);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to get email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.getEmailConfig();

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to update email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as EmailConfig;
    const service = (request as any).service as ServiceContainer;
    const { id } = request.params;
    const encryptedPassword =
      form.password.length < 40 ? encrypt(form.password) : form.password;

    const updatedForm = {
      ...form,
      password: encryptedPassword,
    };

    const data = await service.emailService.updateEmailConfig(id, updatedForm);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to delete email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.deleteEmailConfig(
      request.params.id
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async mailerSend(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'endpoit to send emails';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $to: '',
                        $fro: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    try {
      const service = (request as any).service as ServiceContainer;
      const mailConfig = await service.emailService.getEmailConfig();

      if (mailConfig && mailConfig.length) {
        const { sender, server, username, password, port, ssl_enabled } =
          mailConfig[0];

        const form = request.body as SendEmailForm;
        const decryptedPassword = decrypt(password);

        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: server,
          port: port,
          secure: ssl_enabled,
          auth: {
            user: username,
            pass: decryptedPassword,
          },
        });

        // Define email options
        const mailOptions = {
          from: sender,
          to: form.to,
          subject: form.subject,
          html: form.text,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
          status: "success",
          message: "Email sent successfully",
          info,
        });
      } else {
        res.status(200).json({
          status: "faild",
          message: "Email service is not configured",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ status: "faild", message: "Internal server error" });
    }
  }

  @tryCatchErrorDecorator
  static async sendEmailWithConrta(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = req.body;
    const service = (req as any).service as ServiceContainer;
    const mailConfig = await service.emailService.getEmailConfig();

    const pdfBytes = fs.readFileSync("./template/Wartungsvereinbarung.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];
    page2.drawText(
      `Wartungsvereinbarung
     `,
      {
        x: 190,
        y: 690,
        size: 22,
      }
    );
    page2.drawText(`Anleitung`, {
      x: 265,
      y: 715,
      size: 16,
    });
    page2.drawText(`Ausfüllen`, {
      x: 40,
      y: 650,
      size: 14,
    });
    page2.drawText(
      `•	Die Wartungsvereinbarung ist am PC, Tablet oder Smartphone ausfüllbar, 
     mit der Original Adobe Acrobat Reader App lässt sich auch eine Unterschrift mit dem Finger,
      Stift oder Maus oder eine digitale Signatur hinzufügen.
     Acrobat Reader Download:
     PC: https://get.adobe.com/de/reader/otherversions/
     Google Playstore: https://play.google.com/store/apps/details?id=com.adobe.reader&hl=de Apple
      Iphone/Ipad: https://apps.apple.com/de/app/adobe-fill-sign/id950099951
     •	Die Typen-Bezeichnung Ihrer Geräte finden Sie am oder im Gerät meist auf einem silbernen Aufkleber.
      Beispiele: VCW AT 194/4-5, HG15 WK19, Luna 3 Blue 180i, CGB-2-24, Logamax plus GB192i
     
     `,
      {
        x: 40,
        y: 630,
        size: 10,
      }
    );
    page2.drawText(`Möglichkeiten zur Unterschrift`, {
      x: 40,
      y: 410.5,
      size: 14,
    });
    page2.drawText(
      `•	Auf einem Touch-Monitor, Tablet oder Smartphone kann mit zugehörigem Stift oder Finger
   direkt unterschrieben werden, scrollen Sie zu und vergrößern Sie das Unterschriftenfeld, 
   Stift oder Finger 2 Sekun-
   den gedrückt halten und „Unterschift hinzufügen“ auswählen. Am PC auf „Ausfüllen und Unterschrei- 
   ben“ klicken und dann auf „Selbst signieren“, wenn Sie keine digitale Signatur haben.
•	Oder dem PDF eine elektronische Signatur extern hinzufügen, z.B. Handysignatur
•	Oder ausgefüllte Wartungsvereinbarung speichern, 2 mal Seite 1 ausdrucken und auf Papier unter- schreiben
     `,
      {
        x: 40,
        y: 390,
        size: 10,
      }
    );
    page2.drawText(
      `So können Sie uns die Wartungsvereinbarung zukommen lassen`,
      {
        x: 40,
        y: 220.5,
        size: 14,
      }
    );
    page2.drawText(
      `•	Gespeichertes und elektronisch signiertes PDF an office@b-gas.at senden`,
      {
        x: 40,
        y: 195.5,
        size: 10,
      }
    );
    page2.drawText(`In Papierform`, {
      x: 40,
      y: 168.5,
      size: 14,
    });
    page2.drawText(
      `•	Einen unterschriebenen Ausdruck einem B-GAS Mitarbeiter mitgeben, 
den anderen Ausdruck behalten
•	Oder Wartungsvereinbarung im 90° Winkel von oben mit dem Smartphone fotografieren,
   Foto und ge- speichertes PDF (zwecks Lesbarkeit) per E-Mail an office@b-gas.at
   senden oder per Whatsapp an +43 660 947 28 60
•	Oder unterschriebene Wartungsvereinbarung einscannen und per E-Mail an office@b-gas.at senden
•	Oder einen unterschriebenen Ausdruck per Post an B-GAS GmbH, Wagramer Straße 133, 1220 Wien schicken
   `,
      {
        x: 40,
        y: 150.5,
        size: 10,
      }
    );
    page.drawText(data.title, {
      x: 165,
      y: 677.5,
      size: 8,
    });
    page.drawText(data.name, {
      x: 40,
      y: 650,
      size: 8,
    });
    page.drawText(data.street_number, {
      x: 40,
      y: 620,
      size: 8,
    });
    page.drawText(data.year, {
      x: 320,
      y: 620,
      size: 8,
    });
    page.drawText(data.postal_code, {
      x: 40,
      y: 593,
      size: 8,
    });
    page.drawText(data.device_type, {
      x: 320,
      y: 593,
      size: 8,
    });
    page.drawText(data.address, {
      x: 165,
      y: 593,
      size: 8,
    });
    page.drawText(data.mobile_number, {
      x: 40,
      y: 564,
      size: 8,
    });
    //     page.drawText(data.device_type2, {
    //       x: 320,
    //       y: 564,
    //       size: 8,

    //   });
    page.drawText(data.email, {
      x: 165,
      y: 564,
      size: 7,
    });
    // page.drawText(data.tester, {
    //   x: 420,
    //   y: 691,
    //   size: 8,

    // });
    page.drawText("Zu folgenden Preisen pro Gerät in Wien", {
      x: 195,
      y: 535,
      size: 12,
    });
    page.drawText(data.content1, {
      x: 30,
      y: 450,
      size: 9,
    });

    page.drawText("Aufpreis für Wegzeit Niederösterreich", {
      x: 195,
      y: 470,
      size: 12,
    });

    page.drawText(data.content2, {
      x: 30,
      y: 520,
      size: 9,
    });
    page.drawText(
      "   Im Preis enthalten                                                                                   Nicht im Preis enthalten    ",
      {
        x: 70,
        y: 415,
        size: 10,
      }
    );

    page.drawText(data.content3, {
      x: 30,
      y: 405,
      size: 9,
    });
    page.drawText(
      "                                Alle Preise verstehen sich inkl. 20% USt. Preisänderungen vorbehalten.   ",
      {
        x: 70,
        y: 312,
        size: 9,
      }
    );
    page.drawText("                             Bonus    ", {
      x: 180,
      y: 295,
      size: 12,
    });
    page.drawText(
      `    • 12 Monate Garantie auf Abgaswerte                                           sätze abends, Sa/So/Feiertags, Heizungstörung, Ab-       
    •	Reparaturen innerhalb 24h                                                     flussverstopfung, Rohrbruch, Sanitär...
    •	Reparaturen innerhalb 24h                                                     Jedoch werden unsere Weg- und Arbeitszeit zu Prei-
    •	Keinen Überstundenaufschlag für Notdienstein-                     sen von normalen Öffnungszeiten verrechnet.                                                                       
 `,
      {
        x: 35,
        y: 280,
        size: 10,
      }
    );
    page.drawText(
      `Die Vereinbarung ist jederzeit kündbar und verliert bei Umzug die Gültigkeit. Eine Meldung an uns ist trotz-
dem notwendig, da wir Sie sonst jährlich kontaktieren. Sie sind nicht verpflichtet die jährliche Wartung durch uns in Anspruch zu nehmen,
müssen uns aber Bescheid geben. Mit Ihrer Unterschrift erhalten wir die Erlaubnis, Sie jährlich bezüglich der
anstehenden Wartung zwecks eines Termines zu erinnern (z.B. per E-Mail, Telefon, SMS oder Brief). Gewährleistung auf
unsere Arbeit und Garantie auf Ersatzteile. Mit Ihrer Unterschrift akzeptieren Sie die elektronische Speicherung Ihrer
Daten gemäß DSGVO. Informationen zum Datenschutz finden Sie auf www.installateur-bgas.at/impressum.`,
      {
        x: 30,
        y: 180,
        size: 9,
      }
    );
    if (data.gander == "male") {
      page.drawText("Herr", {
        x: 60,
        y: 680,
        size: 8,
      });
    } else {
      page.drawText("Frau", {
        x: 60,
        y: 680,
        size: 8,
      });
    }
    const modifiedPdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(modifiedPdfBytes);
    const blob = new Blob([buffer], { type: "application/pdf" });
    const uploadEndpoint = "http://localhost:11700/files/upload-contract-file";

    const formData = new FormData();
    formData.append("file", blob, `${req.body.email}.pdf`);

    try {
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      const fileLink = responseData.link;

      const createHtmlTemplate = () => {
        return `
               <!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Responsive Email Template</title>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif">
   <table width="100%" border="0" cellspacing="0" cellpadding="0">
       <tr>
           <td align="center" style="padding: 20px;">
               <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                   <!-- Header -->
                   <tr>
                       <td class="header" style="background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;">
                        B-gaz Email Template
                       </td>
                   </tr>
                   <!-- Body -->
                   <tr>
                       <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                           Hello, All! <br>
                           Lorem odio soluta quae dolores sapiente voluptatibus recusandae aliquam fugit ipsam. <br><br>
                           Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                       </td>
                   </tr>
                   <!-- Call to Action Button -->
                   <tr>
                       <td style="padding: 0px 40px 0px 40px; text-align: center;">
                           <!-- CTA Button -->
                           <table cellspacing="0" cellpadding="0" style="margin: auto;">
                               <tr>
                                   <td align="center" style="background-color: #345C72; padding: 10px 20px; border-radius: 5px;">
                                       <a  href="https://bgas-kalender.at/sign_contra/?first_name=${
                                         data.name.split(" ")[0]
                                       }&last_name=${
          data.name.split(" ")[1] ?? ""
        }&email=${data.email}&phone_number=${data.mobile_number}&location=${
          data.address
        }&gander=${data.gander}&zip_code=${
          data.postal_code ?? ""
        }" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold;">Make a Signiture</a>
                                   </td>
                               </tr>
                           </table>
                       </td>
                   </tr>
                   <!-- Additional Content -->
                   <tr>
                       <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                           Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                       </td>
                   </tr>
               </table>
           </td>
       </tr>
   </table>
</body>
</html>

               `;
      };

      if (mailConfig && mailConfig.length) {
        const { sender, server, username, password, port, ssl_enabled } =
          mailConfig[0];
        const decryptedPassword = decrypt(password);
        const mailOptions = {
          from: sender,
          to: data.email,
          subject: "B-Gas Vertrag",

          html: createHtmlTemplate(),
          attachments: [
            {
              filename: "contract.pdf",
              path:
                "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
                fileLink,
            },
          ],
        };

        const transporter = nodemailer.createTransport({
          host: server,
          port: port,
          secure: ssl_enabled,
          auth: {
            user: username,
            pass: decryptedPassword,
          },
        });

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
          status: "success",
          message: "Email sent successfully",
          info,
        });
      } else {
        res.status(200).json({
          status: "faild",
          message: "Email service is not configured",
        });
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      res.status(500).json({ message: "Error uploading the file." });
    }
  }

  @tryCatchErrorDecorator
  static async sendEmailWithConrtaAndSign(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = req.body;
    const service = (req as any).service as ServiceContainer;
    const mailConfig = await service.emailService.getEmailConfig();

    const pdfBytes = fs.readFileSync("./template/Wartungsvereinbarung.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const base64Image = data.sign_url.split(";base64,").pop();

    const image = await pdfDoc.embedPng(Buffer.from(base64Image, "base64"));
    const page2 = pdfDoc.getPages()[1];
    page2.drawText(
      `Wartungsvereinbarung
     `,
      {
        x: 190,
        y: 690,
        size: 22,
      }
    );
    page2.drawText(`Anleitung`, {
      x: 265,
      y: 715,
      size: 16,
    });
    page2.drawText(`Ausfüllen`, {
      x: 40,
      y: 650,
      size: 14,
    });
    page2.drawText(
      `•	Die Wartungsvereinbarung ist am PC, Tablet oder Smartphone ausfüllbar, 
     mit der Original Adobe Acrobat Reader App lässt sich auch eine Unterschrift mit dem Finger,
      Stift oder Maus oder eine digitale Signatur hinzufügen.
     Acrobat Reader Download:
     PC: https://get.adobe.com/de/reader/otherversions/
     Google Playstore: https://play.google.com/store/apps/details?id=com.adobe.reader&hl=de Apple
      Iphone/Ipad: https://apps.apple.com/de/app/adobe-fill-sign/id950099951
     •	Die Typen-Bezeichnung Ihrer Geräte finden Sie am oder im Gerät meist auf einem silbernen Aufkleber.
      Beispiele: VCW AT 194/4-5, HG15 WK19, Luna 3 Blue 180i, CGB-2-24, Logamax plus GB192i
     
     `,
      {
        x: 40,
        y: 630,
        size: 10,
      }
    );
    page2.drawText(`Möglichkeiten zur Unterschrift`, {
      x: 40,
      y: 410.5,
      size: 14,
    });
    page2.drawText(
      `•	Auf einem Touch-Monitor, Tablet oder Smartphone kann mit zugehörigem Stift oder Finger
   direkt unterschrieben werden, scrollen Sie zu und vergrößern Sie das Unterschriftenfeld, 
   Stift oder Finger 2 Sekun-
   den gedrückt halten und „Unterschift hinzufügen“ auswählen. Am PC auf „Ausfüllen und Unterschrei- 
   ben“ klicken und dann auf „Selbst signieren“, wenn Sie keine digitale Signatur haben.
•	Oder dem PDF eine elektronische Signatur extern hinzufügen, z.B. Handysignatur
•	Oder ausgefüllte Wartungsvereinbarung speichern, 2 mal Seite 1 ausdrucken und auf Papier unter- schreiben
     `,
      {
        x: 40,
        y: 390,
        size: 10,
      }
    );
    page2.drawText(
      `So können Sie uns die Wartungsvereinbarung zukommen lassen`,
      {
        x: 40,
        y: 220.5,
        size: 14,
      }
    );
    page2.drawText(
      `•	Gespeichertes und elektronisch signiertes PDF an office@b-gas.at senden`,
      {
        x: 40,
        y: 195.5,
        size: 10,
      }
    );
    page2.drawText(`In Papierform`, {
      x: 40,
      y: 168.5,
      size: 14,
    });
    page2.drawText(
      `•	Einen unterschriebenen Ausdruck einem B-GAS Mitarbeiter mitgeben, 
den anderen Ausdruck behalten
•	Oder Wartungsvereinbarung im 90° Winkel von oben mit dem Smartphone fotografieren,
   Foto und ge- speichertes PDF (zwecks Lesbarkeit) per E-Mail an office@b-gas.at
   senden oder per Whatsapp an +43 660 947 28 60
•	Oder unterschriebene Wartungsvereinbarung einscannen und per E-Mail an office@b-gas.at senden
•	Oder einen unterschriebenen Ausdruck per Post an B-GAS GmbH, Wagramer Straße 133, 1220 Wien schicken
   `,
      {
        x: 40,
        y: 150.5,
        size: 10,
      }
    );
    page.drawText(data.title, {
      x: 165,
      y: 677.5,
      size: 8,
    });
    page.drawImage(image, {
      x: 430,
      y: 10,
      width: image.width * 0.3,
      height: image.height * 0.3,
      opacity: 1,
    });
    page.drawText(data.name, {
      x: 40,
      y: 650,
      size: 8,
    });
    page.drawText(data.street_number, {
      x: 40,
      y: 620,
      size: 8,
    });
    page.drawText(data.year, {
      x: 320,
      y: 620,
      size: 8,
    });
    page.drawText(data.postal_code, {
      x: 40,
      y: 593,
      size: 8,
    });
    page.drawText(data.device_type, {
      x: 320,
      y: 593,
      size: 8,
    });
    page.drawText(data.address, {
      x: 165,
      y: 593,
      size: 8,
    });
    page.drawText(data.mobile_number, {
      x: 40,
      y: 564,
      size: 8,
    });
    //     page.drawText(data.device_type2, {
    //       x: 320,
    //       y: 564,
    //       size: 8,

    //   });
    page.drawText(data.email, {
      x: 165,
      y: 564,
      size: 7,
    });
    // page.drawText(data.tester, {
    //   x: 420,
    //   y: 691,
    //   size: 8,

    // });
    page.drawText("Zu folgenden Preisen pro Gerät in Wien", {
      x: 195,
      y: 535,
      size: 12,
    });
    page.drawText(data.content1, {
      x: 30,
      y: 450,
      size: 9,
    });

    page.drawText("Aufpreis für Wegzeit Niederösterreich", {
      x: 195,
      y: 470,
      size: 12,
    });

    page.drawText(data.content2, {
      x: 30,
      y: 520,
      size: 9,
    });
    page.drawText(
      "   Im Preis enthalten                                                                                   Nicht im Preis enthalten    ",
      {
        x: 70,
        y: 415,
        size: 10,
      }
    );

    page.drawText(data.content3, {
      x: 30,
      y: 405,
      size: 9,
    });
    page.drawText(
      "                                Alle Preise verstehen sich inkl. 20% USt. Preisänderungen vorbehalten.   ",
      {
        x: 70,
        y: 312,
        size: 9,
      }
    );
    page.drawText("                             Bonus    ", {
      x: 180,
      y: 295,
      size: 12,
    });
    page.drawText(
      `    • 12 Monate Garantie auf Abgaswerte                                           sätze abends, Sa/So/Feiertags, Heizungstörung, Ab-       
    •	Reparaturen innerhalb 24h                                                     flussverstopfung, Rohrbruch, Sanitär...
    •	Reparaturen innerhalb 24h                                                     Jedoch werden unsere Weg- und Arbeitszeit zu Prei-
    •	Keinen Überstundenaufschlag für Notdienstein-                     sen von normalen Öffnungszeiten verrechnet.                                                                       
 `,
      {
        x: 35,
        y: 280,
        size: 10,
      }
    );
    page.drawText(
      `Die Vereinbarung ist jederzeit kündbar und verliert bei Umzug die Gültigkeit. Eine Meldung an uns ist trotz-
dem notwendig, da wir Sie sonst jährlich kontaktieren. Sie sind nicht verpflichtet die jährliche Wartung durch uns in Anspruch zu nehmen,
müssen uns aber Bescheid geben. Mit Ihrer Unterschrift erhalten wir die Erlaubnis, Sie jährlich bezüglich der
anstehenden Wartung zwecks eines Termines zu erinnern (z.B. per E-Mail, Telefon, SMS oder Brief). Gewährleistung auf
unsere Arbeit und Garantie auf Ersatzteile. Mit Ihrer Unterschrift akzeptieren Sie die elektronische Speicherung Ihrer
Daten gemäß DSGVO. Informationen zum Datenschutz finden Sie auf www.installateur-bgas.at/impressum.`,
      {
        x: 30,
        y: 180,
        size: 9,
      }
    );
    if (data.gander == "male") {
      page.drawText("Herr", {
        x: 60,
        y: 680,
        size: 8,
      });
    } else {
      page.drawText("Frau", {
        x: 60,
        y: 680,
        size: 8,
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(modifiedPdfBytes);
    const blob = new Blob([buffer], { type: "application/pdf" });
    const uploadEndpoint = "http://localhost:11700/files/upload-contract-file";
    const formData = new FormData();
    formData.append("file", blob, `${req.body.email}.pdf`);

    if (mailConfig && mailConfig.length) {
      const { sender, server, username, password, port, ssl_enabled } =
        mailConfig[0];
      const decryptedPassword = decrypt(password);

      try {
        const response = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        const fileLink = responseData.link;

        const createHtmlTemplate = () => {
          return `
                           <!DOCTYPE html>
           <html lang="en">
           <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Responsive Email Template</title>
           </head>
           <body style="font-family: 'Poppins', Arial, sans-serif">
               <table width="100%" border="0" cellspacing="0" cellpadding="0">
                   <tr>
                       <td align="center" style="padding: 20px;">
                           <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                               <!-- Header -->
                               <tr>
                                   <td class="header" style="background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    B-gaz Email Template
                                   </td>
                               </tr>
                               <!-- Body -->
                               <tr>
                                   <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                       Hello, All! <br>
                                       Lorem odio soluta quae dolores sapiente voluptatibus recusandae aliquam fugit ipsam. <br><br>
                                       Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                                   </td>
                               </tr>
                               <!-- Call to Action Button -->
                               <tr>
                                   <td style="padding: 0px 40px 0px 40px; text-align: center;">
                                       <!-- CTA Button -->
                                       <table cellspacing="0" cellpadding="0" style="margin: auto;">
                                           <tr>
                                       
                                           </tr>
                                       </table>
                                   </td>
                               </tr>
                               <!-- Additional Content -->
                               <tr>
                                   <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                       Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam corporis sint eum nemo animi velit exercitationem impedit.
                                   </td>
                               </tr>
                           </table>
                       </td>
                   </tr>
               </table>
           </body>
           </html>
           
                           `;
        };
        const mailOptions = {
          from: sender,
          to: data.email,
          subject: "B-Gas Vertrag",

          html: createHtmlTemplate(),
          attachments: [
            {
              filename: "contract.pdf",
              path:
                "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
                fileLink,
            },
          ],
        };
        const mailOptionsAdmin = {
          from: sender,
          to: sender,
          subject: "b-Gas Vertrag",

          html: createHtmlTemplate(),
          attachments: [
            {
              filename: "contract.pdf",
              path:
                "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
                fileLink,
            },
          ],
        };
        const transporter = nodemailer.createTransport({
          host: server,
          port: port,
          secure: ssl_enabled,
          auth: {
            user: username,
            pass: decryptedPassword,
          },
        });

        const contact = {
          first_name: data.first_name,
          last_name: data.last_name,
          lcoation: data.location,
          salutation:
            data.gander == "male"
              ? "Mr"
              : data.gander == "female"
              ? "Mrs"
              : "Company",
          contra: fileLink,
          email: data.email,
          location: data.location,
          zip_code: data.zip_code,
          address: data.location,
          telephone: data.phone_number,
        };

        try {
          const cbe = await service.contactService.getContactByEmail(
            contact.email
          );
          if (cbe) {
            await service.contactService.updateContact(cbe._id!, contact);
          } else {
            await service.contactService.addContact(contact);
          }

          await transporter.sendMail(mailOptions);
          await transporter.sendMail(mailOptionsAdmin);
        } catch (error) {
          throw error;
        }

        res.send("done");
      } catch (error) {
        res.json({
          error: error,
        });
      }
    }
  }

  @tryCatchErrorDecorator
  static async addEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to add email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddEmailTemplateRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.addEmailTemplate(form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getEmailTemplates(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to get email templates';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const { type } = request.query as { type: EmailTemplateType };
    const data = await service.emailService.getEmailTemplates(type);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to update email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as EmailTemplate;
    const service = (request as any).service as ServiceContainer;
    const { id } = request.params;

    const data = await service.emailService.updateEmailTemplate(id, form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to delete email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.deleteEmailTemplate(
      request.params.id
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }
}

export default EmailControllers;
