const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const emailValidator = require('../middleware/emailValidator');
const passwordValidator = require('../middleware/passwordValidator');

router.post('/signup', emailValidator, passwordValidator, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
