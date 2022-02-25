const config = () => {
  return {
    // Define wich files are allowed as RegEx pattern
    allowedFileTypes: /(.png|.jpg|.jpeg|.JPG)$/,

    // Define max size of files in bytes
    shootingFileSize: 10485760, // 10485760 are 10Mb
  };
};
module.exports = config;
