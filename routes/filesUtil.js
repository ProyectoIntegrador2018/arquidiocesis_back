const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './ServiceAccountKey.json',
});
const bucketName = 'arquidiocesis-38f49.appspot.com';

async function configureCors() {
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      method: ['*'],
      origin: ['*'],
      maxAgeSeconds: 3600,
    },
  ]);

  console.log('Cors configuration updated');
}

async function uploadFiles(files) {
  const file_results = [];
  for (const file of files) {
    try {
      await storage
        .bucket(bucketName)
        .upload(`${file.file_path}`, function (err) {
          if (!err) {
            console.log(`file: ${file.file_name} uploaded succesfuly`);
            file_results.push(file.file_name);
          } else {
            console.log(`Unexpected error: ${err}`);
          }
        });
    } catch (e) {
      console.log(`Unexpected error: ${e}`);
    }
  }
}

const uploadBlobFiles = async (firestore, req, res) => {
  if (!req.files) {
    return res.send({
      error: true,
      message: 'files not found in req',
    });
  }

  try {
    const files = await Promise.all(
      req.files.map((file) => {
        const fileName = file.originalname;
        return new Promise((resolve, reject) =>
          storage
            .bucket(bucketName)
            .file(fileName)
            .createWriteStream()
            .on('error', reject)
            .on('finish', () =>
              resolve({
                url: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${fileName}?alt=media`,
                fileName,
              })
            )
            .end(file.buffer)
        );
      })
    );

    return res.send({
      error: false,
      files,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: `${e}`,
    });
  }
};

async function deleteFiles(filenames) {
  for (const filename in filenames) {
    try {
      await storage.bucket(bucketName).file(filename).delete();
    } catch (e) {
      console.log(e);
    }
  }
}

// async function downloadFiles(files) {
// https://firebasestorage.googleapis.com/v0/b/arquidiocesis-38f49.appspot.com/o/files%2FInvestigacion_2.mov?alt=media
// }

module.exports = {
  uploadFiles,
  uploadBlobFiles,
  deleteFiles,
  configureCors,
};
