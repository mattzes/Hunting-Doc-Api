require('dotenv');

const config = () => {
  return {
    // Cors options
    // view all options at https://expressjs.com/en/resources/middleware/cors.html#configuration-options
    corsOptions: {
      origin: process.env.ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTION'],
      credentials: true,
    },

    // Define wich files are allowed as RegEx pattern
    allowedFileTypes: /(.png|.jpg|.jpeg|.JPG)$/,

    // Define max size of files in bytes
    shootingFileSize: 10485760, // 10485760 are 10Mb
  };
};
module.exports = config;
