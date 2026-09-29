// src/services/loanService.js
import api from './api'; 

const loanService = {
  
  // ================= STUDENT SERVICES =================
  
  // 1. Request a loan
  requestLoan: async (bookId, loanPeriod = 30) => {
    try {
      const response = await api.post('/loans', {
        bookId,
        loanPeriod
      });
      return response.data;
    } catch (error) {
      console.error('Request loan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 2. Get student's current loans
  getMyLoans: async () => {
    try {
      const response = await api.get('/loans/my-loans');
      return response.data;
    } catch (error) {
      console.error('Get my loans error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 3. Get student's loan history
  getMyLoanHistory: async () => {
    try {
      const response = await api.get('/loans/my-history');
      return response.data;
    } catch (error) {
      console.error('Get loan history error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 4. Cancel a loan request
  cancelLoanRequest: async (loanId) => {
    try {
      const response = await api.delete(`/loans/${loanId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel loan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ================= STAFF SERVICES =================
  
  // 5. Get pending loan requests (Staff)
  getPendingLoans: async () => {
    try {
      const response = await api.get('/loans/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending loans error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 6. Approve a loan (Staff)
  approveLoan: async (loanId) => {
    try {
      const response = await api.put(`/loans/${loanId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve loan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 7. Reject a loan (Staff)
  rejectLoan: async (loanId, reason = '') => {
    try {
      const response = await api.put(`/loans/${loanId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject loan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 8. Mark loan as returned (Staff)
  returnLoan: async (loanId) => {
    try {
      const response = await api.put(`/loans/${loanId}/return`);
      return response.data;
    } catch (error) {
      console.error('Return loan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 9. Get all loans (Staff)
  // BREAKING CHANGE (P1): the backend now returns a paginated envelope
  // { success, count, total, page, totalPages, data: [...] } instead of a
  // raw array, to support server-side pagination on large loan histories.
  // `filters` accepts the same query params as before (status/userId/bookId)
  // plus the new `page` and `limit`. Callers must now read `.data` for the
  // loan array (see StaffLoanDashboard.jsx).
  getAllLoans: async (filters = {}) => {
    try {
      const response = await api.get('/loans/all', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get all loans error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 10. Get overdue loans (Staff)
  getOverdueLoans: async () => {
    try {
      const response = await api.get('/loans/overdue');
      return response.data;
    } catch (error) {
      console.error('Get overdue loans error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default loanService;
