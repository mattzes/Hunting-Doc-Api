const clientError = (err, req, res, next) => {
  if (err) return res.status(err.status).json({ ok: false, message: err.message });
};

module.exports.clientError = clientError;
