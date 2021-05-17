const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './ServiceAccountKey.json',
});
const bucketName = 'arquidiocesis-38f49.appspot.com';

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
  const url_results = [];
  for (const file of req.files) {
    const blob = storage.bucket(bucketName).file(file.originalName);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      console.log(`Unexpected error in uploadBlobFiles: ${err}`);
      return res.send({
        error: true,
        message: `Unexpected error in uploadBlobFiles: ${err}`,
      });
    });

    blobStream.on('finish', () => {
      url_results.push({
        url: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/files%2F${blob.name}?alt=media`,
        filename: blob.name,
      });
    });
  }

  return res.send({
    error: false,
    files_url: url_results,
  });
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
};
