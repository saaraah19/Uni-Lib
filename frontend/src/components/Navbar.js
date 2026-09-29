import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaHeart, FaBell } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import React from 'react'; 
import { useState, useEffect, useCallback, useMemo } from 'react';
import { favoriteService } from '../services/favoriteService';
import { notificationService } from '../services/notificationService';
import NotificationCenter from '../components/Notifications/NotificationCenter';

// Custom hook for auth state management
const useAuth = () => {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        return {
          isLoggedIn: true,
          user: JSON.parse(userData)
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
        return { isLoggedIn: false, user: null };
      }
    }
    return { isLoggedIn: false, user: null };
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            setAuthState({
              isLoggedIn: true,
              user: JSON.parse(userData)
            });
          } catch (error) {
            setAuthState({ isLoggedIn: false, user: null });
          }
        } else {
          setAuthState({ isLoggedIn: false, user: null });
        }
      }
    };

    const handleAuthChange = (e) => {
      setAuthState(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('favoriteBooks');
    
    window.dispatchEvent(new CustomEvent('authChange', {
      detail: { isLoggedIn: false, user: null }
    }));
    
    return '/';
  }, []);

  return { ...authState, logout };
};

// Custom hook for favorite count
const useFavoriteCount = (isLoggedIn, isStudent) => {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavoriteCount = useCallback(async () => {
    if (!isLoggedIn || !isStudent) return;
    
    setIsLoading(true);
    try {
      const response = await favoriteService.getFavoriteCount();
      if (response.success) {
        setFavoriteCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
      const favorites = JSON.parse(localStorage.getItem("favoriteBooks") || "[]");
      setFavoriteCount(favorites.length);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, isStudent]);

  useEffect(() => {
    fetchFavoriteCount();
    
    const handleFavoriteUpdate = () => {
      fetchFavoriteCount();
    };
    
    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, [fetchFavoriteCount]);

  return { favoriteCount, isLoading };
};

// Custom hook for notification count
const useNotificationCount = (isLoggedIn, isStudent) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotificationCount = useCallback(async () => {
    if (!isLoggedIn || !isStudent) return;
    
    setIsLoading(true);
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setNotificationCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, isStudent]);

  useEffect(() => {
    fetchNotificationCount();
    
    const handleNotificationUpdate = () => {
      fetchNotificationCount();
    };
    
    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdated', handleNotificationUpdate);
  }, [fetchNotificationCount]);

  return { notificationCount, isLoading };
};

// Memoized child components
const ThemeToggle = React.memo(({ isDarkMode, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="
      p-2 
      rounded-lg 
      bg-blue-500 
      dark:bg-gray-700 
      hover:bg-blue-400 
      dark:hover:bg-gray-600
      transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-300
    "
    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {isDarkMode ? (
      <span className="text-yellow-300 text-lg">☀️</span>
    ) : (
      <span className="text-white text-lg">🌙</span>
    )}
  </button>
));

const NotificationBadge = React.memo(({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="
      absolute -top-2 -right-2 
      bg-red-500 text-white 
      text-xs font-bold 
      rounded-full h-5 w-5 
      flex items-center justify-center
    ">
      {count > 9 ? '9+' : count}
    </span>
  );
});

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Derived state
  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'student';
  
  const { favoriteCount } = useFavoriteCount(isLoggedIn, isStudent);
  const { notificationCount } = useNotificationCount(isLoggedIn, isStudent);

  // Memoized navigation handlers
  const handleLogout = useCallback(() => {
    const redirectPath = logout();
    navigate(redirectPath);
  }, [logout, navigate]);

  const handleLogoClick = useCallback(() => {
    if (isLoggedIn) {
      navigate(isStaff ? '/staff-dashboard' : '/student-dashboard');
    } else {
      navigate('/');
    }
  }, [isLoggedIn, isStaff, navigate]);

  // Memoize navbar links to prevent unnecessary re-renders
  const navbarLinks = useMemo(() => {
    if (!isLoggedIn) {
      return (
        <>
          <Link 
            to="/login" 
            className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors"
          >
            Connexion
          </Link>
          <Link 
            to="/register" 
            className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors"
          >
            Inscription
          </Link>
        </>
      );
    }

    return (
      <>
        {isStudent && (
          <>
            {/* Favorites Link */}
            <Link 
              to="/favorites" 
              className="flex items-center text-xs sm:text-sm md:text-base hover:text-blue-200 dark:hover:text-blue-300 relative group transition-colors"
              title="View favorites"
            >
              <FaHeart className="mr-1 group-hover:scale-110 transition-transform" /> 
              <span className="hidden lg:inline">Favoris</span>
              <NotificationBadge count={favoriteCount} />
            </Link>
            
            {/* Notification Dropdown - Visible on all screens */}
            <div className="relative" title="Quick preview">
              <NotificationCenter />
            </div>
            
            {/* Link to Full Notifications Page - Visible on larger screens */}
            <Link 
              to="/notifications" 
              className="hidden lg:flex items-center text-xs sm:text-sm md:text-base hover:text-blue-200 dark:hover:text-blue-300 relative group transition-colors"
              title="View all notifications"
            >
              <FaBell className="mr-1 group-hover:scale-110 transition-transform" /> 
              <span>Toutes</span>
              {notificationCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 px-1.5 py-0.5 rounded-full">
                  {notificationCount}
                </span>
              )}
            </Link>
          </>
        )}
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center text-xs sm:text-sm md:text-base hover:text-blue-200 dark:hover:text-blue-300 group transition-colors"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-1 group-hover:scale-110 transition-transform" /> 
          <span className="hidden lg:inline">Déconnexion</span>
        </button>
      </>
    );
  }, [isLoggedIn, isStudent, favoriteCount, notificationCount, handleLogout]);

  return (
    <nav className="
      bg-blue-600 
      dark:bg-gray-800 
      text-white 
      p-3 sm:p-4
      transition-colors 
      duration-300
      shadow-md
      sticky
      top-0
      z-50
    ">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center text-sm sm:text-base md:text-xl font-bold hover:text-blue-200 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg px-1 sm:px-2 py-1"
          aria-label="Home"
        >
          <FaBook className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Librairie Universitaire</span>
          <span className="sm:hidden">LU</span>
        </button>

        {/* Right side links */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          
          {navbarLinks}
          
        </div>
      </div>
    </nav>
  );
};

// Add display names for better debugging
ThemeToggle.displayName = 'ThemeToggle';
NotificationBadge.displayName = 'NotificationBadge';

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Navbar);