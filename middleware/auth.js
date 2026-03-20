const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: 'Not authorized as admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && req.user.adminLevel === 'super') {
    next();
  } else {
    return res.status(403).json({ msg: 'Not authorized as super admin' });
  }
};

const vendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    return res.status(403).json({ msg: 'Not authorized as vendor' });
  }
};

const franchiser = (req, res, next) => {
  if (req.user && req.user.role === 'franchiser') {
    next();
  } else {
    return res.status(403).json({ msg: 'Not authorized as franchiser' });
  }
};

module.exports = { protect, admin, superAdmin, vendor, franchiser };