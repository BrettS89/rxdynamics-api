exports.handleError = (req, err, endpoint) => {
  req.status(500).json({ message: 'an error occured' });
}
