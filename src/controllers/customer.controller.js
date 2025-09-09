const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// REGISTER
exports.customerRegister = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const existingUser = await Customer.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: existingUser.email === email
          ? 'Email is already registered.'
          : 'Mobile number is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await Customer.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    res.status(201).json({
      status: true,
      message: 'Customer registered successfully',
      data: newCustomer
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ status: false, message: 'Registration failed', error: error.message });
  }
};
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await Customer.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false, data: null });
        }
        res.status(200).json({ message: 'Profile fetched successfully', status: true, data: user });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Internal server error', status: false, data: null });
    }
};
// LOGIN
exports.customerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ status: false, message: 'Customer not found' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }
    customer.is_active = true;
    customer.login_time = new Date();
    const token = jwt.sign(
      { id: customer._id },
      process.env.ACCESS_TOKEN_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      data: customer
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: false, message: 'Login failed', error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customer = await Customer.find({}).select('-password');
    if (!customer) {
      return res.status(404).json({ status: false, message: 'Customer not found' });
    }

    res.status(200).json({ status: true, data: customer });
  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({ status: false, message: 'Failed to get customer', error: error.message });
  }
};

