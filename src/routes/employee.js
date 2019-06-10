const router = require('express').Router();
const employee = require('../controllers/employee');

router.post('/login', employee.login);
router.post('/create', employee.createEmployee);
router.post('/changepasswordemployee', employee.changePasswordByEmployee);
router.post('/changepasswordadmin', employee.changePasswordByAdmin);

module.exports = router;
