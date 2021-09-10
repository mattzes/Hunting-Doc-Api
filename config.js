require('dotenv');

const config = () => {
  let origin;
  if (process.env.MODE == 'development') {
    origin = ['http://localhost:3000', process.env.ORIGIN];
  } else if (process.env.MODE == 'productive') {
    origin = process.env.ORIGIN;
  }
  return {
    // Cors options
    // view all options at https://expressjs.com/en/resources/middleware/cors.html#configuration-options
    corsOptions: {
      origin: origin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },

    // Define wich files are allowed as RegEx pattern
    allowedFileTypes: /(.png|.jpg|.jpeg|.JPG)$/,

    // Define max size of files in bytes
    shootingFileSize: 10485760, // 10485760 are 10Mb
  };
};
module.exports = config;
