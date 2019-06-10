const router = require('express').Router();
const transferRequest = require('../controllers/transferRequest');

router.get('/nearbypharmacies/:npi', transferRequest.getNearbyPharmacies);
router.post('/promptmember', transferRequest.promptTransferRequest);

module.exports = router;
