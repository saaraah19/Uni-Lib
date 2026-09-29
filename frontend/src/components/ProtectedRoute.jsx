import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // Not logged in
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userData);
    
    // Check role if specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // IMPORTANT: Don't send them to login if they are already logged in!
  // Send them to their actual valid dashboard instead.
  const homePath = user.role === 'staff' ? '/staff-dashboard' : '/student-dashboard';
      return <Navigate to={homePath} />;
    }
    
    return children;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;