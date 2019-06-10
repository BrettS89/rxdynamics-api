exports.handleError = (req, err, endpoint) => {
  res.status(500).json({ message: 'an error occured' });
}
