const express = require('express');
const FavoriteController = require('../controllers/FavoriteController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();


// Import your auth middleware
//const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
//router.use(protect);

// Define routes
router.post('/', authMiddleware,FavoriteController.addToFavorites);           // POST /api/favorites
router.delete('/:bookId', authMiddleware,FavoriteController.removeFromFavorites); // DELETE /api/favorites/:bookId
router.get('/', authMiddleware,FavoriteController.getUserFavorites);          // GET /api/favorites
router.get('/check/:bookId',authMiddleware, FavoriteController.checkIsFavorite); // GET /api/favorites/check/:bookId
router.get('/count', authMiddleware,FavoriteController.getFavoriteCount);     // GET /api/favorites/count

module.exports = router;