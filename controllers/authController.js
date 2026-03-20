const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Franchiser = require('../models/Franchiser');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const createTransporter = require('../config/emailConfig');

// Register new user (customer)
const register = async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ msg: 'Mobile number already registered' });
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      mobile,
      password,
      role: 'user',
    });

    await user.save();

    // Generate token
    const payload = { 
      id: user.id, 
      role: user.role, 
      username: user.username,
      email: user.email
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ 
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Register vendor
const registerVendor = async (req, res) => {
  const { 
    username, 
    email, 
    mobile, 
    password,
    businessName,
    businessType,
    businessAddress,
    gstNumber,
    panNumber,
    serviceAreas
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ msg: 'Mobile number already registered' });
      }
    }

    // Parse businessAddress if it's a string
    let parsedAddress = businessAddress;
    if (typeof businessAddress === 'string') {
      try {
        parsedAddress = JSON.parse(businessAddress);
      } catch (e) {
        parsedAddress = {};
      }
    }

    // Create new vendor user
    const user = new User({
      username,
      email,
      mobile,
      password,
      role: 'vendor',
      businessName,
      businessType,
      businessAddress: parsedAddress,
      gstNumber,
      panNumber,
      serviceAreas: serviceAreas ? (typeof serviceAreas === 'string' ? serviceAreas.split(',') : serviceAreas) : [],
      isVerified: false,
    });

    await user.save();

    // Create vendor profile
    const vendor = new Vendor({
      userId: user._id,
    });

    await vendor.save();

    // Generate token
    const payload = { 
      id: user.id, 
      role: user.role, 
      username: user.username,
      email: user.email,
      businessName: user.businessName
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ 
      msg: 'Vendor registered successfully. Please wait for verification.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        businessName: user.businessName,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Vendor registration error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Register franchiser
const registerFranchiser = async (req, res) => {
  const { 
    username, 
    email, 
    mobile, 
    password,
    franchiseName,
    franchiseRegion,
    territories
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ msg: 'Mobile number already registered' });
      }
    }

    // Parse territories if it's a string
    let parsedTerritories = [];
    if (territories) {
      try {
        parsedTerritories = typeof territories === 'string' ? JSON.parse(territories) : territories;
      } catch (e) {
        parsedTerritories = [];
      }
    }

    // Create new franchiser user
    const user = new User({
      username,
      email,
      mobile,
      password,
      role: 'franchiser',
      franchiseName,
      franchiseRegion,
    });

    await user.save();

    // Create franchiser profile
    const franchiser = new Franchiser({
      userId: user._id,
      region: franchiseRegion,
      territories: parsedTerritories,
    });

    await franchiser.save();

    // Generate token
    const payload = { 
      id: user.id, 
      role: user.role, 
      username: user.username,
      email: user.email,
      franchiseName: user.franchiseName
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ 
      msg: 'Franchiser registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        franchiseName: user.franchiseName,
        franchiseCode: user.franchiseCode
      }
    });
  } catch (err) {
    console.error('Franchiser registration error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Register admin (super admin only)
const registerAdmin = async (req, res) => {
  const { 
    username, 
    email, 
    mobile, 
    password,
    adminLevel,
    department
  } = req.body;

  try {
    // Check if requesting user is super admin
    if (!req.user || req.user.role !== 'admin' || req.user.adminLevel !== 'super') {
      return res.status(403).json({ msg: 'Not authorized to create admin' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ msg: 'Mobile number already registered' });
      }
    }

    // Create new admin user
    const user = new User({
      username,
      email,
      mobile,
      password,
      role: 'admin',
      adminLevel: adminLevel || 'support',
    });

    await user.save();

    // Create admin profile
    const admin = new Admin({
      userId: user._id,
      department: department || 'support',
      permissions: [],
    });

    await admin.save();

    return res.status(201).json({ 
      msg: 'Admin created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        adminLevel: user.adminLevel
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Login user (works for all roles)
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if vendor is verified
    if (user.role === 'vendor' && !user.isVerified) {
      return res.status(403).json({ msg: 'Your account is pending verification' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ msg: 'Your account has been deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with role information
    const payload = { 
      id: user.id, 
      role: user.role, 
      username: user.username,
      email: user.email
    };
    
    // Add role-specific fields to payload
    if (user.role === 'vendor') {
      payload.businessName = user.businessName;
      payload.isVerified = user.isVerified;
    } else if (user.role === 'franchiser') {
      payload.franchiseName = user.franchiseName;
      payload.franchiseCode = user.franchiseCode;
    } else if (user.role === 'admin') {
      payload.adminLevel = user.adminLevel;
    }
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Prepare user response based on role
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    // Add role-specific fields
    if (user.role === 'vendor') {
      userResponse.businessName = user.businessName;
      userResponse.businessType = user.businessType;
      userResponse.isVerified = user.isVerified;
    } else if (user.role === 'franchiser') {
      userResponse.franchiseName = user.franchiseName;
      userResponse.franchiseCode = user.franchiseCode;
      userResponse.franchiseRegion = user.franchiseRegion;
    } else if (user.role === 'admin') {
      userResponse.adminLevel = user.adminLevel;
      userResponse.department = user.department;
      userResponse.designation = user.designation;
      userResponse.employeeId = user.employeeId;
    }

    return res.json({ 
      msg: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get dashboard data based on role
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetOTP -resetOTPExpire');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let dashboardData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    };

    // Get role-specific dashboard data
    switch (user.role) {
      case 'vendor':
        const vendor = await Vendor.findOne({ userId: user._id });
        const bookings = await Booking.find({ 'vendor.vendorId': user._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .catch(() => []); // Handle if Booking model doesn't exist
        
        dashboardData = {
          ...dashboardData,
          vendor: vendor || {},
          recentBookings: bookings || [],
          stats: {
            totalBookings: await Booking.countDocuments({ 'vendor.vendorId': user._id }).catch(() => 0),
            completedBookings: await Booking.countDocuments({ 
              'vendor.vendorId': user._id, 
              status: 'completed' 
            }).catch(() => 0),
            pendingBookings: await Booking.countDocuments({ 
              'vendor.vendorId': user._id, 
              status: 'pending' 
            }).catch(() => 0),
            totalEarnings: vendor?.earnings?.total || 0,
          }
        };
        break;

      case 'franchiser':
        const franchiser = await Franchiser.findOne({ userId: user._id });
        const assignedVendors = await User.find({ 
          _id: { $in: franchiser?.vendors?.map(v => v.vendorId) || [] } 
        });
        
        dashboardData = {
          ...dashboardData,
          franchiser: franchiser || {},
          vendors: assignedVendors || [],
          stats: {
            totalVendors: assignedVendors.length,
            activeVendors: assignedVendors.filter(v => v.isVerified).length,
            totalEarnings: franchiser?.earnings?.total || 0,
          }
        };
        break;

      case 'admin':
        const admin = await Admin.findOne({ userId: user._id });
        
        dashboardData = {
          ...dashboardData,
          admin: admin || {},
          stats: {
            totalUsers: await User.countDocuments({ role: 'user' }),
            totalVendors: await User.countDocuments({ role: 'vendor' }),
            totalFranchisers: await User.countDocuments({ role: 'franchiser' }),
            totalAdmins: await User.countDocuments({ role: 'admin' }),
            pendingVerifications: await User.countDocuments({ 
              role: 'vendor', 
              isVerified: false 
            }),
            totalBookings: await Booking.countDocuments().catch(() => 0),
            totalRevenue: await Booking.aggregate([
              { $match: { 'payment.status': 'paid' } },
              { $group: { _id: null, total: { $sum: '$payment.amount' } } }
            ]).catch(() => [{ total: 0 }]),
          }
        };
        break;

      default: // regular user
        const userBookings = await Booking.find({ 'user.userId': user._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .catch(() => []);
        
        dashboardData = {
          ...dashboardData,
          recentBookings: userBookings || [],
          stats: {
            totalBookings: await Booking.countDocuments({ 'user.userId': user._id }).catch(() => 0),
            completedBookings: await Booking.countDocuments({ 
              'user.userId': user._id, 
              status: 'completed' 
            }).catch(() => 0),
            upcomingBookings: await Booking.countDocuments({ 
              'user.userId': user._id, 
              status: 'confirmed',
              'schedule.date': { $gte: new Date() }
            }).catch(() => 0),
          }
        };
    }

    return res.json(dashboardData);
  } catch (err) {
    console.error('Get dashboard error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Forgot password - Send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"OCSA" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>You requested to reset your password. Use the following OTP to complete the process:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Reset password with OTP
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetOTP -resetOTPExpire');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    // Add role-specific fields
    if (user.role === 'vendor') {
      userResponse.businessName = user.businessName;
      userResponse.businessType = user.businessType;
      userResponse.isVerified = user.isVerified;
      
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        userResponse.vendorProfile = vendor;
      }
    } else if (user.role === 'franchiser') {
      userResponse.franchiseName = user.franchiseName;
      userResponse.franchiseCode = user.franchiseCode;
      
      const franchiser = await Franchiser.findOne({ userId: user._id });
      if (franchiser) {
        userResponse.franchiserProfile = franchiser;
      }
    } else if (user.role === 'admin') {
      userResponse.adminLevel = user.adminLevel;
      userResponse.department = user.department;
      userResponse.designation = user.designation;
      userResponse.employeeId = user.employeeId;
      
      const admin = await Admin.findOne({ userId: user._id });
      if (admin) {
        userResponse.adminProfile = admin;
      }
    }

    return res.json(userResponse);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get all vendors (for admin/franchiser)
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('-password -resetOTP -resetOTPExpire');
    
    return res.json(vendors);
  } catch (err) {
    console.error('Get vendors error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Verify vendor (admin only)
const verifyVendor = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ msg: 'Vendor not found' });
    }

    vendor.isVerified = true;
    await vendor.save();

    return res.json({ msg: 'Vendor verified successfully' });
  } catch (err) {
    console.error('Verify vendor error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  register,
  registerVendor,
  registerFranchiser,
  registerAdmin,
  login,
  getDashboard,
  forgotPassword,
  resetPassword,
  getMe,
  getVendors,
  verifyVendor,
};