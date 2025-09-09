const express = require('express');
const upload = require('../utils/uploadProfile');
const { register,deleteAccount, changePasswordByOtp, getProfile, updateProfile, otpResetPassword,  toggleAgentBreak, loginUser, getAllAgents, getAllCustomer } = require('../controllers/user.controller');
const { validateToken, isAdmin,  } = require('../utils/validateToken');

const router = express.Router();

// Create a new user
router.post('/sign-up',upload.single('profileImage'), register);
// Login user
router.post('/login', loginUser);
// User break
router.put('/break',validateToken, toggleAgentBreak);
// Get all user
router.get('/', getAllAgents);
// Get all customer
router.get('/customers',getAllCustomer);
// View profile by token
router.get('/profile', validateToken, getProfile);
// Update profile by token
router.put('/profile-update', upload.single('profileImage'), validateToken, updateProfile);
// Delete account by token
router.delete('/account/:id', validateToken, deleteAccount);
// Send otp reset password
router.post('/reset-otp-pass', otpResetPassword);
// Change password by token
router.post('/change-otp-pass/verify', changePasswordByOtp);

module.exports = router;
