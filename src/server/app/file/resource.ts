import express from "express";
import multer from "multer";
// import path from "path";
import admin from 'firebase-admin';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const configure = (app: express.Router) => {
  app.post('/files/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.files?.file
      const bucket = admin.storage().bucket('gs://b-gas-13308.appspot.com');
      const fileBuffer = file.data;
      const fileName = file.name;
      const fileRef = bucket.file(`services/${fileName}`);
      await fileRef.save(fileBuffer, { contentType: file.mimetype });
      const fileLink = await fileRef.getSignedUrl({
            version: 'v2',
            action: 'read',
            expires: new Date(3000, 0, 1),
      });

      if(fileLink && fileLink.length){
        res.json({ message: 'File uploaded successfully', link: fileLink[0].replace('https://storage.googleapis.com/b-gas-13308.appspot.com/', '') });
      } else {
        res.status(500).json({message: 'Error uploading the file.'});
      }
    } catch (error) {
      res.status(500).json({message: 'Error uploading the file.'});
    }
  });

  app.get('/files/download/:filename', async (req, res) => {
    try{
    const downloadFileName = req.params.filename
    const options = {
      destination: downloadFileName
  };
    const bucket = admin.storage().bucket('gs://b-gas-13308.appspot.com');
  
    await bucket.file('services/' + downloadFileName).download(options);
    return res.download(downloadFileName);
  } catch(err) {
    res.status(500).json({message: 'Error downloading the file.'});
  }
  });
};