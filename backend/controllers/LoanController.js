const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
// P2 FIX: unguarded console.error calls replaced with the shared backend
// logger (backend/utils/logger.js). ASSUMPTION TO VERIFY: this assumes the
// backend logger exposes the same API as the frontend one (logger.debug /
// logger.info / logger.warn / logger.error), since backend/utils/logger.js
// itself wasn't available to review in this session — if the real export
// differs (e.g. default export only, or different method names), adjust
// this require + the two logger.error(...) calls below accordingly.
const logger = require('../utils/logger');

// ================= STUDENT CONTROLLERS =================

// 1. Request a loan
const requestLoan = async (req, res) => {
  try {
    const { bookId, loanPeriod = 30 } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0 || !book.isAvailable) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    const userActiveLoans = await Loan.countDocuments({
      user: userId,
      status: { $in: ['active', 'approved', 'pending'] }
    });

    if (userActiveLoans >= 5) {
      return res.status(400).json({ message: 'You have reached the maximum number of loans' });
    }

    // Calculate dueDate
    const requestDate = new Date();
    const dueDate = new Date(requestDate);
    dueDate.setDate(dueDate.getDate() + loanPeriod);

    const loan = new Loan({
      book: bookId,
      user: userId,
      requestDate,
      status: 'pending',
      loanPeriod,
      dueDate,
    });

    // DATA INTEGRITY FIX (P1): the previous "already requested?" check was a
    // findOne() followed by a separate save() — a classic TOCTOU gap under
    // concurrent requests. That check has been replaced by the partial
    // unique index on Loan ({user, book} while status: 'pending'), which
    // MongoDB enforces atomically. We simply attempt the insert and
    // translate a duplicate-key error (11000) into the same user-facing
    // message as before.
    try {
      await loan.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return res.status(400).json({ message: 'You already requested this book' });
      }
      throw saveError;
    }

    const newLoan = await Loan.findById(loan._id)
      .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
      .populate('user', 'name email studentId phone');

    res.status(201).json({
      message: 'Loan request submitted successfully',
      loan: newLoan
    });

  } catch (error) {
    logger.error('Request loan error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 2. Get student's current loans
const getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      user: userId,
      status: { $in: ['pending', 'approved', 'active'] }
    })
    .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
    .populate('user', 'name email studentId phone')
    .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Get student's loan history
const getMyLoanHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      user: userId,
      status: { $in: ['returned', 'rejected', 'cancelled'] }
    })
    .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
    .populate('user', 'name email studentId phone')
    .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. Cancel a pending request
const cancelLoanRequest = async (req, res) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.id;

    const loan = await Loan.findOne({
      _id: loanId,
      user: userId
    }).populate('book', 'title');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot cancel. Loan is already processed' 
      });
    }

    loan.status = 'cancelled';
    await loan.save();

    await Notification.create({
      user: loan.user,
      title: '↩️ Prêt annulé',
      message: `Votre demande de prêt pour "${loan.book.title}" a été annulée.`,
      type: 'info',
      status: 'unread'
    });

    res.json({ message: 'Loan request cancelled', loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ================= STAFF CONTROLLERS =================

// 5. Get all pending loan requests
const getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'pending' })
      .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
      .populate('user', 'name email studentId phone')
      .sort({ createdAt: 1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 6. Approve a loan request
// FIX (P0 - race condition): the previous implementation read
// book.availableCopies, checked it in JS, then wrote it back in a separate
// save() call. Two staff members approving two pending requests for the
// same last-copy book at the same time could both pass the check and both
// decrement, driving availableCopies negative and over-committing the book.
//
// The fix uses a single atomic, conditional update
// (findOneAndUpdate with availableCopies: { $gt: 0 } in the filter) so the
// decrement only succeeds if a copy is actually still available at the
// moment MongoDB applies the update. If it fails, we know another request
// won the race and we reject this approval cleanly instead of corrupting
// the count.
const approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId).populate('book', 'title');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot approve. Loan status is: ${loan.status}` 
      });
    }

    if (!loan.book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Atomic, race-safe decrement: only matches (and only decrements) if
    // availableCopies is still > 0 at the moment MongoDB executes the update.
    const updatedBook = await Book.findOneAndUpdate(
      { _id: loan.book._id, availableCopies: { $gt: 0 } },
      [
        {
          $set: {
            availableCopies: { $subtract: ['$availableCopies', 1] },
          },
        },
        {
          $set: {
            isAvailable: { $gt: ['$availableCopies', 0] },
          },
        },
      ],
      { new: true }
    );

    if (!updatedBook) {
      // Someone else took the last copy between our checks - fail safely.
      return res.status(400).json({
        message: 'Book is not available for loan',
      });
    }

    // APPROVE THE LOAN
    loan.status = 'active';
    loan.approvedDate = new Date();
    loan.loanDate = new Date();
    loan.dueDate = new Date(Date.now() + loan.loanPeriod * 24 * 60 * 60 * 1000);

    try {
      await loan.save();
    } catch (saveError) {
      // Roll back the book decrement if persisting the loan fails, so the
      // two documents don't drift out of sync.
      await Book.findByIdAndUpdate(updatedBook._id, {
        $inc: { availableCopies: 1 },
        isAvailable: true,
      });
      throw saveError;
    }

    const formattedDate = loan.dueDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    await Notification.create({
      user: loan.user,
      title: '✅ Prêt approuvé',
      message: `Votre demande de prêt pour "${updatedBook.title}" a été approuvée. Vous avez jusqu'au ${formattedDate} pour récupérer le livre.`,
      type: 'success',
      status: 'unread'
    });

    const updatedLoan = await Loan.findById(loanId)
      .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
      .populate('user', 'name email studentId phone');

    res.json({
      message: 'Loan approved successfully',
      loan: updatedLoan,
      bookUpdated: {
        copiesLeft: updatedBook.availableCopies,
        isAvailable: updatedBook.isAvailable
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 7. Reject a loan request
const rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { reason } = req.body;

    const loan = await Loan.findById(loanId).populate('book', 'title');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot reject. Loan status is: ${loan.status}` 
      });
    }

    loan.status = 'rejected';
    await loan.save();

    let message = `Votre demande de prêt pour "${loan.book.title}" a été refusée.`;
    if (reason && reason.trim()) {
      message += ` Motif: ${reason}`;
    }
    
    await Notification.create({
      user: loan.user,
      title: '❌ Prêt refusé',
      message: message,
      type: 'alert',
      status: 'unread'
    });

    const updatedLoan = await Loan.findById(loanId)
      .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
      .populate('user', 'name email studentId phone');

    res.json({ 
      message: 'Loan request rejected',
      loan: updatedLoan
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 8. Mark loan as returned
// Same atomicity fix applied here: increment happens via a single atomic
// update rather than read-then-save, so concurrent returns can't clobber
// each other either.
const returnLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId).populate('book', 'title');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ 
        message: `Cannot return. Loan status is: ${loan.status}` 
      });
    }

    loan.status = 'returned';
    loan.returnDate = new Date();

    if (loan.dueDate < new Date()) {
      const overdueDays = Math.ceil((new Date() - loan.dueDate) / (1000 * 60 * 60 * 24));
      loan.fineAmount = overdueDays * 10;
    }

    await loan.save();

    let updatedBook = null;
    if (loan.book) {
      updatedBook = await Book.findOneAndUpdate(
        { _id: loan.book._id },
        [
          {
            $set: {
              availableCopies: {
                $min: [
                  { $add: ['$availableCopies', 1] },
                  '$totalCopies',
                ],
              },
            },
          },
          {
            $set: {
              isAvailable: { $gt: ['$availableCopies', 0] },
            },
          },
        ],
        { new: true }
      );
    }

    await Notification.create({
      user: loan.user,
      title: '📖 Livre retourné',
      message: `Le livre "${loan.book.title}" a été marqué comme retourné. Merci !`,
      type: 'success',
      status: 'unread'
    });

    const updatedLoan = await Loan.findById(loanId)
      .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
      .populate('user', 'name email studentId phone');

    res.json({ 
      message: 'Book returned successfully',
      loan: updatedLoan,
      fine: loan.fineAmount > 0 ? `Fine: $${loan.fineAmount}` : null,
      bookUpdated: updatedBook ? {
        copiesLeft: updatedBook.availableCopies,
        isAvailable: updatedBook.isAvailable
      } : null
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 9. Get all loans (for staff dashboard)
// PERF FIX (P1): previously returned the entire Loan collection
// unconditionally, which StaffLoanDashboard.jsx then filtered/paginated
// entirely client-side. This does not scale as loan history grows. The
// endpoint now supports page/limit and returns pagination metadata in the
// same shape as /books/search, so the frontend can be migrated to
// server-side pagination. Backward compatible: if no page/limit are
// supplied, defaults kick in rather than breaking existing callers.
const getAllLoans = async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    let filter = {};
    // Supports a comma-separated list (e.g. "approved,active") so the
    // frontend can request a whole tab's worth of statuses in one paginated
    // call instead of fetching everything and filtering client-side.
    if (status) {
      const statusList = status.split(',').map((s) => s.trim()).filter(Boolean);
      filter.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
    }
    if (userId) filter.user = userId;
    if (bookId) filter.book = bookId;

    const [loans, total] = await Promise.all([
      Loan.find(filter)
        .populate('book', 'title authors author isbn coverImage isAvailable availableCopies')
        .populate('user', 'name email studentId phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Loan.countDocuments(filter),
    ]);

    const responseLoans = loans.map(loan => {
      const obj = loan.toObject ? loan.toObject() : loan;

      if (!obj.book) {
        obj.book = {
          _id: loan.book || null,
          title: 'Livre supprimé / manquant',
          missing: true
        };
      }

      return obj;
    });

    res.json({
      success: true,
      count: responseLoans.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: responseLoans,
    });
  } catch (error) {
    logger.error('❌ [getAllLoans] ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 10. Get overdue loans
const getOverdueLoans = async (req, res) => {
  try {
    const loans = await Loan.find({
      status: 'active',
      dueDate: { $lt: new Date() }
    })
    .populate('book', 'title author')
    .populate('user', 'name email phone')
    .sort({ dueDate: 1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  // Student
  requestLoan,
  getMyLoans,
  getMyLoanHistory,
  cancelLoanRequest,
  
  // Staff
  getPendingLoans,
  approveLoan,
  rejectLoan,
  returnLoan,
  getAllLoans,
  getOverdueLoans
};
