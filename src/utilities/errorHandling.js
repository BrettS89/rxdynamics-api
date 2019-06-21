exports.handleError = (res, err, endpoint) => {
  const message = err.message.message ? err.message.message : err.message;
  const status = err.message.status ? err.message.status : 500;
  console.log(endpoint, message);
  res.status(status).json({ error: message });
};
