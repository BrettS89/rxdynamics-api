exports.handleError = (res, err, endpoint) => {
  const message = err.message.message ? err.message.message : err.message;
  console.log(endpoint + message);
  const status = err.message.status ? err.message.status : 500;
  res.status(status).json({ error: message });
};
