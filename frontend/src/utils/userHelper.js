// P2_LIBRARY/src/utils/userHelper.js

// Get complete user data with defaults
export const getCompleteUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    
    const parsedUser = JSON.parse(savedUser);
    
    // Return user with default values for missing fields
    return {
      // Real data from backend
      ...parsedUser,
      
      // Display fields (with defaults)
      studentId: parsedUser.userCode || parsedUser._id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.email}`,
      
      // Stats (initialize to 0 - you'll update from API later)
      currentLoans: parsedUser.currentLoans || 0,
      favorites: parsedUser.favorites || [],
      booksRead: parsedUser.booksRead || 0,
      
      // For UI display
      department: parsedUser.department || "Computer Science",
      year: parsedUser.year || "3rd Year",
      memberSince: parsedUser.createdAt || new Date().toISOString(),
      
      // Calculated fields
      initials: parsedUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Update user stats from API (you'll call this after fetching real data)
export const updateUserStats = async (userId) => {
  try {
   
    
    // For now, return mock data
    return {
      currentLoans: 3,
      favorites: [],
      booksRead: 12
    };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
};

// Save updated user to localStorage
export const saveUser = (updatedData) => {
  try {
    const currentUser = getCompleteUser();
    if (!currentUser) return null;
    
    const newUser = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
};