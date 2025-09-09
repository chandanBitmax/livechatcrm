
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const transporter  = require('../config/emailConfig');
const generateEmailOtp = require('../utils/generateEmailOtp');
const getIndiaTime = require('../utils/timezone');
const { default: axios } = require('axios');
const { getClientIp, getLocation } = require('../utils/ipLocation');

//------------------< CREATE USER >------------------//
exports.register = async (req, res) => {
    // const adminId = req.user?.id;
    try {
        const { user_name,name,department, mobile, email, password,role} = req.body;

        if (!user_name || !name|| !mobile|| !email || !password ) {
            return res.status(400).json({ message: "All fields are mandatory", status: false });
        }

        // // ✅ Check if trying to create Admin and Admin already exists
        // if (role === "Admin") {
        //     const existingAdmin = await User.findOne({ role: "Admin" });
        //     if (existingAdmin) {
        //         return res.status(400).json({ message: "An Admin already exists. Cannot create another Admin.", status: false });
        //     }
        // }

        // ✅ Check duplicate email or mobile
        const existingAuthor = await User.findOne({ email });
        if (existingAuthor) {
            const conflictField = existingAuthor.email === email ? 'email' : 'mobile';
            return res.status(400).json({
                message: `User with the provided ${conflictField} already exists.`,
                status: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
       const profileImage = req.file ? req.file.filename : "not available";

        const newAuthor = await User.create({
            user_name,
            name,
            mobile,
            email,
            department,
            // createdBy:adminId,
            password: hashedPassword,
            role,
            profileImage
        });

        return res.status(201).json({ message: 'SignUp successful!', status: true, data: newAuthor });

    } catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({ message: 'Internal Server Error', status: false });
    }
};
//------------------< UPDATE PROFILE >------------------//
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required', status: false });
        }

        // Safely destructure fields from the request body
        const { user_name, name,  mobile, email, } = req.body;

        const profileImage = req.file?.filename;

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        // Update fields if provided
        user.user_name = user_name || user.user_name;
        user.name = name || user.name;
        user.mobile = mobile || user.mobile;
        user.email = email || user.email;

        // Update profile image if provided
        if (profileImage) {
            user.profileImage = profileImage;
        }
        // Save the updated user data to the database
        const updatedUser = await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully!',
            status: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({ message: 'Internal Server Error', status: false });
    }
};
//------------------< USER PROFILE >------------------//
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false, data: null });
        }
        res.status(200).json({ message: 'Profile fetched successfully', status: true, data: user });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Internal server error', status: false, data: null });
    }
};
//------------------< DELETE ACCOUNT >------------------//
exports.deleteAccount = async (req, res) => {
    try {
        const id = req.params?.id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false, data: null });
        }
        res.status(200).json({ message: "account deleted", status: true, data: user });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
};
//------------------< ALL USER >------------------//
exports.getAllAgents = async (req, res) => {
    try {
        const user = await User.find({role: "Agent"});
        // If no data found, return 404
        if (!user.length === 0) {
            return res.status(404).json({ message: 'No data found for user.' });
        }
        // Send successful response with user
        return res.status(200).json({ message: 'All user finded', data: user });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user. Please try again later.' });
    }
};

//------------------< ALL Customer >------------------//
exports.getAllCustomer = async (req, res) => {
    try {
        const user = await User.find({role: "Customer"});
        // If no data found, return 404
        if (!user) {
            return res.status(404).json({ message: 'No data found for user.' });
        }
        // Send successful response with user
        return res.status(200).json({ message: 'All customer finded', data: user });
    } catch (error) {
        // Log the error and send a 500 status code
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user. Please try again later.' });
    }
};
//------------------< LOGIN >------------------//
exports.loginUser = async (req, res) => {
  try {
    const ip = getClientIp(req);
    const location = getLocation(ip);

    console.log("User IP:", ip);
    console.log("User Location:", location);


    const { email, employee_id, password } = req.body;

    if (!password) {
      return res.status(400).json({ status: false, message: "Password is required." });
    }

    let user;

    // 🔹 Agent → employee_id se login
    if (employee_id) {
      user = await User.findOne({ employee_id });
    } 
    // 🔹 Customer & Admin → email se login
    else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({ status: false, message: "Email or Employee ID is required." });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: false, message: "Invalid credentials." });
    }

    // Update Session
    user.is_active = true;
    user.login_time = getIndiaTime();
    user.workStatus = "active";
    user.break_time = null;
    user.location = location;
    await user.save();

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ status: false, message: "Server Error. Please try again." });
  }
};

//------------------< BREAK >------------------//
exports.toggleAgentBreak = async (req, res) => {
  const agentId = req.user?.id;

  try {
    const agent = await User.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agent not found', status: false });

    const now = getIndiaTime();

    if (agent.workStatus === "active") {
      // Agent is going on break
      agent.workStatus = "break";
      agent.break_time = now;

      await agent.save();
      return res.status(200).json({
        message: 'Break started',
        status: true,
        data: agent
      });

    } else if (agent.workStatus === "break") {
      // Break ending
      const breakStart = agent.break_time ? new Date(agent.break_time) : now;
      const breakEnd = now;

      let breakDurationInMinutes = 0;

      // ✅ Only calculate if both dates are valid
      if (!isNaN(breakStart) && !isNaN(breakEnd)) {
        const durationMs = breakEnd - breakStart;
        breakDurationInMinutes = Math.max(Math.round(durationMs / 60000), 0);
      }

      // ✅ Avoid NaN
      if (isNaN(breakDurationInMinutes)) breakDurationInMinutes = 0;

      // ✅ Save break log
      agent.breakLogs.push({
        start: breakStart,
        end: breakEnd,
        duration: breakDurationInMinutes
      });

      // Sort logs (latest first)
      agent.breakLogs.sort((a, b) => new Date(b.start) - new Date(a.start));

      // Update status
      agent.workStatus = "active";
      agent.break_time = null;

      await agent.save();

      return res.status(200).json({
        message: `Break ended after ${breakDurationInMinutes} minute(s), agent is now active`,
        status: true,
        data: {
          agent,
          breakDurationInMinutes
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid work status', status: false });
    }
  } catch (err) {
    console.error('Toggle break error:', err);
    return res.status(500).json({ message: 'Server error', status: false });
  }
};


//------------------< SEND OTP RESET PASSWORD >------------------//
let virtualOtp = null;
let virtualid;
exports.otpResetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.', status: false, data: null });
        }
        const userInfo = await User.findOne({ email });
        if (!userInfo) {
            return res.status(404).json({ message: 'Email is not registered. Please sign up.', status: false, data: null });
        }
        virtualid = userInfo._id;
        const newOtp = generateEmailOtp();
        virtualOtp = newOtp;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "OTP to reset password",
            text: `Your OTP is: ${newOtp}.`
        });
        return res.status(200).json({ message: 'OTP sent to your email. Please check your inbox.', status: true, data: null });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Internal server error.', status: false, data: null });
    }
};
//------------------< CHANGE PASSWORD OTP >------------------//
exports.changePasswordByOtp = async (req, res) => {
    try {
        let otpAttempts = 0;
        const { password, confirmPassword, otp } = req.body;
        if (!password || !confirmPassword || !otp) {
            return res.status(400).json({ message: 'All fields are mandatory', status: false, data: null });
        }
        if (otpAttempts >= 3) {
            virtualOtp = null;
            return res.status(400).json({ message: 'Your OTP has expired', status: false, data: null });
        }
        if (virtualOtp !== otp) {
            otpAttempts++;
            return res.status(400).json({ message: 'OTP does not match. Please enter the correct OTP', status: false, data: null });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match", status: false, data: null });
        }
        const newHashedPassword = await bcrypt.hash(password, 10);
        const update = { password: newHashedPassword };
        const updatedUser = await User.findByIdAndUpdate(virtualid, update, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "Recruiter not found", status: false, data: null });
        }
        virtualOtp = null;
        otpAttempts = 0;
        return res.status(200).json({ message: "Password changed successfully", status: true, data: updatedUser });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: 'Internal Server Error', status: false, data: null });
    }
};