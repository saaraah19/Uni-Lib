// src/pages/STAFF/LoanManagement/index.js
// Barrel export for loan management components
//
// CLEANUP (P1/P2): PendingLoans.js, ActiveLoans.js and OverdueLoans.js were
// early standalone components superseded by StaffLoanDashboard.jsx, which
// is the only one actually mounted in the app's routing
// (see StaffDashboard.js -> currentPage === 'LoanRequests'). They were
// dead code and have been removed from the repo along with this export.

export { default as StaffLoanDashboard } from './StaffLoanDashboard';
export { default as LoanActionCard } from './LoanActionCard';
