const Favorite = require('../models/Favorite');
const Book = require('../models/Book');

// ====================================
// 1. ADD TO FAVORITES
// ====================================
exports.addToFavorites = async (req, res) => {
  try {
  
    // Get data from request
    const { bookId } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate inputs
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      book: bookId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Book already in favorites'
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      user: userId,
      book: bookId
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites successfully',
      data: {
        id: favorite._id,
        bookId: favorite.book,
        userId: favorite.user,
        addedAt: favorite.addedAt
      }
    });

  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    
    // Handle duplicate error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book already in favorites'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ====================================
// 2. REMOVE FROM FAVORITES
// ====================================
exports.removeFromFavorites = async (req, res) => {
  try {
    
    const { bookId } = req.params;
    const userId = req.user.id;

    // Find and delete favorite
    const deletedFavorite = await Favorite.findOneAndDelete({
      user: userId,
      book: bookId
    });

    if (!deletedFavorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Removed from favorites successfully'
    });

  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ====================================
// 3. GET USER'S FAVORITES
// ====================================
exports.getUserFavorites = async (req, res) => {
  try {
    
    const userId = req.user.id;

    // Get favorites with book details
    const favorites = await Favorite.find({ user: userId })
      .populate('book', 'title authors coverImage category isbn description')
      .sort({ addedAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites.map(fav => ({
        favoriteId: fav._id,
        addedAt: fav.addedAt,
        book: fav.book
      }))
    });

  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ====================================
// 4. CHECK IF BOOK IS FAVORITE
// ====================================
exports.checkIsFavorite = async (req, res) => {
  try {
    console.log('📌 Check favorite request received');
    
    const { bookId } = req.params;
    const userId = req.user.id;

    // Check if exists
    const favorite = await Favorite.findOne({
      user: userId,
      book: bookId
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite
    });

  } catch (error) {
    console.error('❌ Error checking favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ====================================
// 5. GET FAVORITE COUNT
// ====================================
exports.getFavoriteCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Favorite.countDocuments({ user: userId });
    
    res.status(200).json({
      success: true,
      count: count
    });
    
  } catch (error) {
    console.error('❌ Error getting favorite count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};