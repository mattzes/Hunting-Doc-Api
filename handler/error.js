const { MulterError } = require('multer');

const clientError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    console.log(err.code);
    switch (err.code) {
      case 'LIMIT_FILE_COUNT':
        err = { status: 415, msg: 'too much files in upload' };
        break;
      case 'LIMIT_FILE_SIZE':
        err = { status: 415, msg: 'too large file for upload' };
        break;
      default:
        err = { status: 500, msg: 'something went wrong while uploading files' };
        break;
    }
  }
  if (err) return res.status(err.status).json({ ok: false, message: err.msg });
};

module.exports.clientError = clientError;
