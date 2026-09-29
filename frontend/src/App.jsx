import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import {ErrorBoundary} from 'react-error-boundary'
// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/UserAuth/Login";
import Register from "./pages/UserAuth/Register";
// Components
import Navbar from "./components/Navbar";
import StaffDashboard from "./pages/STAFF/StaffDashboard";
import StudentDashboard from "./pages/Students/StudentDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import BookCatalog from "./pages/Students/BookCatalog/BookCatalog";
import ProtectedRoute from './components/ProtectedRoute';
import NotificationsPage from "./components/Notifications/NotificationPage";
// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>Something went wrong</h1>
      <pre style={{ color: 'red', marginBottom: '1rem' }}>
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Try again
      </button>
    </div>
  );
}


// Create a Layout component that conditionally shows navbar
// UPDATED: "/" (landing page) also has its own minimal header, so the main
// app Navbar is hidden there too, in addition to /login and /register.
const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      <main>{children}</main>
    </>
  );
};

// NEW: root route now shows the public LandingPage for logged-out visitors,
// instead of forcing an immediate redirect straight to /login. Logged-in
// users still get redirected straight to their dashboard, so returning
// users don't see the marketing page every time.
const RootRoute = () => {
  const userData = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      return <Navigate to={user.role === 'staff' ? '/staff-dashboard' : '/student-dashboard'} />;
    } catch (error) {
      // Corrupted localStorage - fall through to landing page
    }
  }

  return <LandingPage />;
};

function App() {
  return (
    <ThemeProvider>
        <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          // Log error to your error reporting service
          console.error('Error:', error, errorInfo);
        }}
      >
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              {/* Public landing page (marketing/intro, login/signup CTAs) */}
              <Route path="/" element={<RootRoute />} />

              {/* Routes publiques (no navbar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes protégées (with navbar) */}
              <Route path="/books" element={
                <ProtectedRoute>
                  <BookCatalog />
                </ProtectedRoute>
              } />
              
              <Route path="/staff-dashboard" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />

              {/*
                "/test" debug route intentionally removed (P2) — see prior
                audit notes. Do not re-add without a ProtectedRoute wrapper.
              */}

              <Route path="/favorites" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <FavoritesPage />
                </ProtectedRoute>
              } />

              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              
            </Routes>
          </Layout>
          
          {/* Container pour les notifications */}
          <ToastContainer position="top-right" />
        </div>
      </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
