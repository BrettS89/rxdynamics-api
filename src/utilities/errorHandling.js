exports.handleError = (res, err, endpoint) => {
  console.log(endpoint + err);
  res.status(500).json({ message: 'an error occured' });
}
