const express = require('express');
const router = express.Router();

const { customerRegister, customerLogin,  getCustomers, getProfile } = require('../controllers/customer.controller');
const upload = require('../utils/uploadProfile');
const { validateToken } = require('../utils/validateToken');

// REGISTER
router.post('/register',upload.single("profileImage"), customerRegister);
router.post('/login',customerLogin);
router.get('/profile', validateToken, getProfile);
router.get('/',getCustomers)
module.exports = router;
