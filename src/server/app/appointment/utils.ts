import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import { Appointment, Contact } from "../../../database-client";
import { getService } from "../clients";

export async function uploadCotract(contact: Contact, form: Appointment) {
  const pdfBytes = fs.readFileSync("./template/Wartungsvereinbarung.pdf");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const base64Image = contact.sign_url!.split(";base64,").pop();
  let contractLink = undefined;
  const emailConfig = await getService().emailService.getEmailConfig();

  const image = await pdfDoc.embedPng(Buffer.from(base64Image!, "base64"));
  const page2 = pdfDoc.getPages()[1];
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold
  );

  page2.drawText(
    `Wartungsvereinbarung
   `,
    {
      x: 190,
      y: 690,
      size: 22,
      font: timesRomanBoldFont,
    }
  );
  page2.drawText(`Anleitung`, {
    x: 265,
    y: 715,
    size: 16,
    font: timesRomanBoldFont,
  });
  page2.drawText(`Ausfüllen`, {
    x: 40,
    y: 650,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
   `
    •   Die Wartungsvereinbarung ist am PC, Tablet oder Smartphone ausfüllbar, mit der Original Adobe Acrobat
        Reader App lässt sich auch eine Unterschrift mit dem Finger, Stift oder Maus oder eine 
        digitale Signatur hinzufügen.
        Acrobat Reader Download:
        PC: https://get.adobe.com/de/reader/otherversions/
        Google Playstore: https://play.google.com/store/apps/details?id=com.adobe.reader&hl=de Apple
        Iphone/Ipad: https://apps.apple.com/de/app/adobe-fill-sign/id950099951
    •   Die Typen-Bezeichnung Ihrer Geräte finden Sie am oder im Gerät meist auf einem silbernen Aufkleber.
        Beispiele: VCW AT 194/4-5, HG15 WK19, Luna 3 Blue 180i, CGB-2-24, Logamax plus GB192i`,
    {
      x: 40,
      y: 640,
      size: 10,
    }
  );
  page2.drawText(`Möglichkeiten zur Unterschrift`, {
    x: 40,
    y: 410.5,
    size: 14,
    font: timesRomanBoldFont,
  });
  page2.drawText(
   `
    •	Auf einem Touch-Monitor, Tablet oder Smartphone kann mit zugehörigem Stift oder Finger direkt unterschrieben
        werden, scrollen Sie zu und vergrößern Sie das Unterschriftenfeld, Stift oder Finger 2 Sekun-
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
  page2.drawText(`So können Sie uns die Wartungsvereinbarung zukommen lassen`, {
    x: 40,
    y: 220.5,
    size: 14,
    font: timesRomanBoldFont,
  });
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
    font: timesRomanBoldFont,
  });
  page2.drawText(
   `
    •	Einen unterschriebenen Ausdruck einem B-GAS Mitarbeiter mitgeben, den anderen Ausdruck behalten
    •	Oder Wartungsvereinbarung im 90° Winkel von oben mit dem Smartphone fotografieren, Foto und ge-
        speichertes PDF (zwecks Lesbarkeit) per E-Mail an office@b-gas.at senden oder per Whatsapp an
        +43 660 947 28 60
    •	Oder unterschriebene Wartungsvereinbarung einscannen und per E-Mail an office@b-gas.at senden
    •	Oder einen unterschriebenen Ausdruck per Post an B-GAS GmbH, Wagramer Straße 133, 1220 Wien
        schicken.`,
    {
      x: 40,
      y: 155,
      size: 10,
    }
  );
  page.drawImage(image, {
    x: 415,
    y: 10,
    width: image.width * 0.3,
    height: image.height * 0.3,
    opacity: 1,
  });
    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const dateString = `${date}/${month}/${year}`;
    page.drawText(dateString, {
      x: 50,
      y: 10,
      size: 10,
      font: timesRomanBoldFont,
    });
  page.drawText(contact.first_name + " " + contact.last_name, {
    x: 40,
    y: 650,
    size: 8,
  });
  page.drawText(contact.address, {
    x: 40,
    y: 620,
    size: 8,
  });
  page.drawText(form.model || "", {
    x: 320,
    y: 620,
    size: 8,
  });
  page.drawText(form.year || "", {
    x: 523,
    y: 620,
    size: 8,
  });
  page.drawText(contact.zip_code, {
    x: 40,
    y: 593,
    size: 8,
  });
  page.drawText(contact.location, {
    x: 165,
    y: 593,
    size: 8,
  });
  page.drawText(contact.telephone, {
    x: 40,
    y: 564,
    size: 8,
  });
  page.drawText(contact.email, {
    x: 165,
    y: 564,
    size: 7,
  });
  page.drawText("Zu folgenden Preisen pro Gerät in Wien", {
    x: 195,
    y: 535,
    size: 12,
    font: timesRomanBoldFont,
  });
  page.drawText(form.selected_devices || "", {
    x: 30,
    y: 520,
    size: 9,
  });
  page.drawText("*Brennerdichtung (€ 60 - € 90) im Preis bereits enthalten, andere Geräte benötigen diese nicht.", {
    x: 100,
    y: 500,
    size: 9,
  });

  page.drawText("Aufpreis für Wegzeit Niederösterreich", {
    x: 195,
    y: 470,
    size: 12,
    font: timesRomanBoldFont,
  });

  page.drawText(
    `Bis ca. 30 min Fahrt € 20`,
    {
      x: 30,
      y: 450,
      size: 9,
    }
  );
  page.drawText(
    `Bis ca. 60 min Fahrt	€ 55`,
    {
      x: 400,
      y: 450,
      size: 9,
    }
  );
  page.drawText(
    "   Im Preis enthalten                                                                                     Nicht im Preis enthalten",
    {
      x: 70,
      y: 415,
      size: 10,
      font: timesRomanBoldFont,
    }
  );

  page.drawText(
    `                   
    •	Komplette Wartung während Öffnungszeiten                                                                              • Etwaige Materialkosten   
    •	Arbeitszeit pauschal, egal wie lange es dauert                                                                        • Reparaturen
    •	Anfahrt Wien               
  `,
    {
      x: 30,
      y: 405,
      size: 9,
    }
  );
  page.drawText(
    "Alle Preise verstehen sich inkl. 20% USt. Preisänderungen vorbehalten.",
    {
      x: 170,
      y: 312,
      size: 9,
    }
  );
  page.drawText("Bonus", {
    x: 265,
    y: 295,
    size: 12,
    font: timesRomanBoldFont,
  });
  page.drawText(
 `• 12 Monate Garantie auf Abgaswerte                                           sätze abends, Sa/So/Feiertags, Heizungstörung, Ab-       
  •	Reparaturen innerhalb 24h                                                   flussverstopfung, Rohrbruch, Sanitär...
  •	Reparaturen innerhalb 24h                                                   Jedoch werden unsere Weg- und Arbeitszeit zu Prei-
  •	Keinen Überstundenaufschlag für Notdienstein-                               sen von normalen Öffnungszeiten verrechnet.                                                                       
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
  page.drawText(contact.salutation, {
    x: 60,
    y: 680,
    size: 8,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(modifiedPdfBytes);
  const blob = new Blob([buffer], { type: "application/pdf" });
  const uploadEndpoint = "http://localhost:11700/files/upload-contract-file";
  const formData = new FormData();
  formData.append("file", blob, `${contact.email}.pdf`);
  try {
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    contractLink = responseData.link;

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

    getService().emailService.sendMail({
      to: contact.email,
      subject: "B-Gas Vertrag",
      text: createHtmlTemplate(),
      attachments: [
        {
          filename: "contract.pdf",
          path:
            "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
            contractLink,
        },
      ],
    });

    if (emailConfig && emailConfig.length) {
      getService().emailService.sendMail({
        to: emailConfig[0].sender,
        subject: "b-Gas Vertrag",
        text: createHtmlTemplate(),
        attachments: [
          {
            filename: "contract.pdf",
            path:
              "https://storage.googleapis.com/b-gas-13308.appspot.com/" +
              contractLink,
          },
        ],
      });
    }
  } catch (error) {
    console.log("error", error);
    return null;
  }

  return contractLink;
}
