// Importe tes modèles Mongoose
const User = require('../models/User');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const express = require('express');
const router = express.Router();
const { getOrSet } = require('../utils/simpleCache');

// PERF FIX (P2): /stats/summary is polled independently by both
// StaffDashboard.js and Reports.js, each doing 3 countDocuments on every
// mount/render with no caching or de-duplication between the two
// components. Cached for 60s — short enough to stay reasonably live for a
// staff dashboard, long enough to absorb the redundant calls from both
// screens.
router.get('/summary', async (req, res) => {
  try {
    const data = await getOrSet('stats:summary', 60 * 1000, async () => {
      const [userCount, bookCount, loanCount] = await Promise.all([
        User.countDocuments(),
        Book.countDocuments(),
        // FIX: approveLoan() sets status to 'active' (never 'approved'), so counting
        // only 'approved' made the dashboard's "active loans" counter always 0.
        Loan.countDocuments({ status: { $in: ['approved', 'active'] } })
      ]);

      return {
        users: userCount,
        books: bookCount,
        loans: loanCount
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
