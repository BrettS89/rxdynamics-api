const router = require('express').Router();
const transferRequest = require('../controllers/transferRequest');

router.get('/nearbypharmacies/:npi', transferRequest.getNearbyPharmacies);
router.post('/promptmember', transferRequest.promptMember);
router.post('/initiate', transferRequest.initiate);
router.post('/complete', transferRequest.completed);

router.post('/addpharmacy', transferRequest.addPharmacy);

module.exports = router;
