const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const httpError = require('../utils/httpError');

function authenticate(required) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header && !required) return next();

    const token = /^Bearer (\S+)$/.exec(header || '')?.[1];
    let id;
    try {
      const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      id = claims.id;
    } catch {
      return next(httpError(401, 'Please sign in to continue.'));
    }
    if (!/^[a-f\d]{24}$/i.test(id || '')) return next(httpError(401, 'Please sign in to continue.'));
    try {
      req.user = await User.findById(id);
      if (!req.user) return next(httpError(401, 'This account no longer exists.'));
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { protect: authenticate(true), optionalAuth: authenticate(false) };
