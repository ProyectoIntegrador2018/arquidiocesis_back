const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './ServiceAccountKey.json',
});
const bucketName = 'arquidiocesis-38f49.appspot.com';

/*

file architectur

file = {
    file_name = string,
    file_path = string,
}
*/
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
  deleteFiles,
};
