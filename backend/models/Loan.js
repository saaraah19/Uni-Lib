//LoanModel la ou on aura le lien entre le livre et l'utilisateur
//bookID, UserId,LoanDate,dueDate,returnDate,Status
const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
    },
    loanDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },
    loanPeriod: {
      type: Number,
      default: 15,
    },
    renewalCount: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// PERF FIX: these composite indexes match the actual query patterns used by
// the controllers (getMyLoans/getMyLoanHistory filter by {user, status},
// getPendingLoans/getAllLoans filter by {status}, both sorted by createdAt).
// Without them, Mongo falls back to collection scans as the Loan collection
// grows.
loanSchema.index({ user: 1, status: 1, createdAt: -1 });
loanSchema.index({ status: 1, createdAt: -1 });
loanSchema.index({ book: 1, status: 1 });

// DATA INTEGRITY FIX: partial unique index preventing two concurrent
// "pending" loan requests for the same (user, book) pair. This closes the
// TOCTOU gap in requestLoan() where a findOne-then-save check could be
// raced by two near-simultaneous requests. MongoDB enforces this at the
// storage layer regardless of application-level timing.
loanSchema.index(
  { user: 1, book: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "unique_pending_loan_per_user_book",
  }
);

module.exports = mongoose.model("Loan", loanSchema);
