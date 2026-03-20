const User = require('../models/User');

// Create initial super admin (run once)
const createInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@ocsa.com' });
    
    if (!existingAdmin) {
      const admin = new User({
        username: 'Super Admin',
        email: 'admin@ocsa.com',
        mobile: '9999999999',
        password: 'admin123',
        role: 'admin',
        adminLevel: 'super',
        department: 'management',
        designation: 'Super Administrator',
        isActive: true,
        permissions: [
          'manage_users',
          'manage_vendors',
          'manage_franchisers',
          'manage_services',
          'manage_categories',
          'view_reports',
          'manage_settings',
          'manage_admins'
        ],
        address: {
          street: 'OCSA Headquarters',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        }
      });

      await admin.save();
      console.log('✅ Initial admin created successfully');
      console.log('📧 Email: admin@ocsa.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
  }
};

// Create new admin (super admin only)
const createAdmin = async (req, res) => {
  try {
    // Check if requesting user is super admin
    if (req.user.role !== 'admin' || req.user.adminLevel !== 'super') {
      return res.status(403).json({ 
        msg: 'Not authorized. Only super admins can create new admins.' 
      });
    }

    const {
      username,
      email,
      mobile,
      password,
      adminLevel,
      department,
      designation,
      joiningDate,
      address,
      permissions
    } = req.body;

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

    // Create new admin
    const admin = new User({
      username,
      email,
      mobile,
      password,
      role: 'admin',
      adminLevel: adminLevel || 'support',
      department: department || 'support',
      designation: designation || 'Administrator',
      joiningDate: joiningDate || new Date(),
      address: address || {},
      permissions: permissions || [],
      isActive: true,
    });

    await admin.save();

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.resetOTP;
    delete adminResponse.resetOTPExpire;

    return res.status(201).json({
      msg: 'Admin created successfully',
      admin: adminResponse
    });
  } catch (err) {
    console.error('Create admin error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all admins
const getAdmins = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const admins = await User.find({ role: 'admin' })
      .select('-password -resetOTP -resetOTPExpire')
      .sort({ createdAt: -1 });

    return res.json(admins);
  } catch (err) {
    console.error('Get admins error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: 'admin' 
    }).select('-password -resetOTP -resetOTPExpire');

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    return res.json(admin);
  } catch (err) {
    console.error('Get admin error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    // Check if user is super admin or updating themselves
    if (req.user.role !== 'admin' || (req.user.adminLevel !== 'super' && req.user.id !== req.params.id)) {
      return res.status(403).json({ 
        msg: 'Not authorized to update this admin' 
      });
    }

    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: 'admin' 
    });

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    const {
      username,
      mobile,
      adminLevel,
      department,
      designation,
      address,
      permissions,
      isActive
    } = req.body;

    // Update fields
    if (username) admin.username = username;
    if (mobile) admin.mobile = mobile;
    if (adminLevel && req.user.adminLevel === 'super') admin.adminLevel = adminLevel;
    if (department) admin.department = department;
    if (designation) admin.designation = designation;
    if (address) admin.address = address;
    if (permissions && req.user.adminLevel === 'super') admin.permissions = permissions;
    if (isActive !== undefined && req.user.adminLevel === 'super') admin.isActive = isActive;

    await admin.save();

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return res.json({
      msg: 'Admin updated successfully',
      admin: adminResponse
    });
  } catch (err) {
    console.error('Update admin error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Delete admin (super admin only)
const deleteAdmin = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'admin' || req.user.adminLevel !== 'super') {
      return res.status(403).json({ 
        msg: 'Only super admins can delete admins' 
      });
    }

    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: 'admin' 
    });

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot delete your own account' });
    }

    await admin.deleteOne();

    return res.json({ msg: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments({ role: 'user' }),
      totalVendors: await User.countDocuments({ role: 'vendor' }),
      totalFranchisers: await User.countDocuments({ role: 'franchiser' }),
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      pendingVendors: await User.countDocuments({ role: 'vendor', isVerified: false }),
      recentUsers: await User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email createdAt'),
    };

    return res.json(stats);
  } catch (err) {
    console.error('Get admin stats error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createInitialAdmin,
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
};