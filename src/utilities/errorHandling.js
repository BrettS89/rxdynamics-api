exports.handleError = (res, err, endpoint) => {
  const message = err.message ? err.message : 'error';
  const status = err.status ? err.status : 500;
  console.log(endpoint, message);
  res.status(status).json({ error: message });
};
