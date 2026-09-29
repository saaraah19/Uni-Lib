const express = require('express');
const router = express.Router();
const usercontroller = require('../controllers/UserController');
const verifytoken = require('../middlewares/authMiddleware');
const onlyStaffAllow = require('../middlewares/OnlyStaffMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} = require('../validation/userValidators');

// Routes publiques avec validation
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  usercontroller.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  usercontroller.login
);

// Route protégée avec validation
router.put(
  '/update-password',
  verifytoken,
  updatePasswordValidator,
  validate,
  usercontroller.updatePassword
);

// NEW: replaces the removed STAFF_DOMAINS/STAFF_CODES auto-assignment
// mechanisms. Only an existing staff member can promote another user to
// staff. See backend/README (or deployment notes) for how to bootstrap the
// very first staff account manually.
router.put(
  '/:id/promote-to-staff',
  verifytoken,
  onlyStaffAllow,
  usercontroller.promoteToStaff
);

module.exports = router;
