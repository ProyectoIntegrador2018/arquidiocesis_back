const fUtil = require('../routes/filesUtil');

const file_test = 'best_hackathon_ever.jpg';
const file_blob =
  '/Users/danygaytan/Documents/9-semestre/proyecto-integrador/arquidiocesis-back/best_hackathon_ever.jpg';

//fUtil.deleteFiles(file_test);

fUtil.uploadFile(file_blob, file_test);
