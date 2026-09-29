const express = require("express");
const bookController = require('../controllers/BookController')
const authMiddleware = require('../middlewares/authMiddleware')
const onlyStaffAllow = require('../middlewares/OnlyStaffMiddleware')
const validate = require('../middlewares/validate')
const {
  createBookValidator,
  updateBookValidator,
  searchBooksValidator,
  listBooksValidator,
} = require('../validation/bookValidators')
const router = express.Router();

//Endpoints CRUD BOOKS Management 

// ⭐ Routes SPÉCIFIQUES (without parameters) - MUST come BEFORE parametrized routes
router.get('/search', authMiddleware, searchBooksValidator, validate, bookController.searchBooks);
router.get('/categories',authMiddleware, bookController.getCategories);
router.get('/languages',authMiddleware, bookController.getLanguages);
router.get('/stats',authMiddleware, bookController.getBookStats);
router.get('/recent', bookController.getRecentBooks);           // sans paramètre

// Routes avec paramètres
// NOTE (P1): /get is now paginated (page/limit query params) instead of
// returning the entire ~11k-document collection on every call. Defaults to
// a sane page size when no params are supplied to avoid breaking existing
// callers outright while still capping payload size.
router.get('/get', authMiddleware, listBooksValidator, validate, bookController.readAllBooks)
router.get('/recent/:limit', bookController.getRecentBooks);    // avec paramètre
router.get('/cote/:cote',authMiddleware, bookController.getBookByCote);
router.get('/get/:id',authMiddleware, bookController.readOneBook)

// POST/PUT/DELETE
router.post('/create', authMiddleware, onlyStaffAllow, createBookValidator, validate, bookController.createBook)
router.put('/update/:id', authMiddleware, onlyStaffAllow, updateBookValidator, validate, bookController.updateBook)
router.delete('/delete/:id',authMiddleware,onlyStaffAllow,bookController.deleteBook)

module.exports = router;
