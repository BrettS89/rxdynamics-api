const router = require('express').Router();
const pbm = require('../controllers/pbm');

router.get('/rxdetails/:tr', pbm.getRxDetails);

module.exports = router;
