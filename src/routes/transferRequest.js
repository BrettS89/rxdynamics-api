const router = require('express').Router();
const transferRequest = require('../controllers/transferRequest');

router.get('/nearbypharmacies/:npi', transferRequest.getNearbyPharmacies);
router.post('/promptmember', transferRequest.promptMember);
router.post('/claim', transferRequest.employeeClaimTR);
router.post('/initiate', transferRequest.initiate);
router.post('/complete', transferRequest.completed);
router.get('/openrequests', transferRequest.getOpenTransferRequests);
router.get('/myrequests', transferRequest.getMyTransferRequests);

router.post('/addpharmacy', transferRequest.addPharmacy);

module.exports = router;
