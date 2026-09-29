const express = require('express');
const router = express.Router();
const {
 requestLoan,
  getMyLoans,
  getMyLoanHistory,
  cancelLoanRequest,
  getPendingLoans,
  approveLoan,
  rejectLoan,
  returnLoan,
  getAllLoans,
  getOverdueLoans
} = require('../controllers/LoanController');

// Middleware (you probably already have this)
const authMiddleware = require('../middlewares/authMiddleware')
const onlyStaffAllow = require('../middlewares/OnlyStaffMiddleware')
// ========== ONLY 5 ROUTES ==========

// Student routes
router.post('/', authMiddleware, requestLoan);        // Request loan
router.get('/my-loans', authMiddleware, getMyLoans);  // View my loans
router.get('/my-history', authMiddleware, getMyLoanHistory);
router.delete('/:loanId/cancel', authMiddleware, cancelLoanRequest);
// Staff routes (add staff check if you want)
router.get('/pending', authMiddleware,onlyStaffAllow, getPendingLoans);
router.put('/:loanId/approve',authMiddleware, onlyStaffAllow, approveLoan);
router.put('/:loanId/reject',authMiddleware, onlyStaffAllow, rejectLoan);
router.put('/:loanId/return',authMiddleware, onlyStaffAllow, returnLoan);
router.get('/all',authMiddleware,onlyStaffAllow, getAllLoans);
router.get('/overdue', authMiddleware,onlyStaffAllow, getOverdueLoans);

module.exports = router;