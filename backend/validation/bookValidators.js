const { body, query } = require('express-validator');

const ALLOWED_CATEGORIES = [
  "Non Categorized",
  "fiction",
  "science-fiction",
  "philosophie",
  "histoire",
  "biographie",
  "roman",
  "linguistique",
  "littérature américaine",
  "littérature britannique",
  "littérature africaine",
  "civilisation américaine",
  "civilisation britannique",
  "histoire africaine",
  "théâtre",
  "poésie",
  "sciences",
  "traduction",
  "éducation",
  "général",
];

const ALLOWED_LANGUAGES = ["en", "fr", "es"];

// Shared rules for create + update (update fields are optional since it's
// a partial payload, but must still be well-formed when present).
const createBookValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis.')
    .isLength({ max: 500 }).withMessage('Le titre est trop long.'),
  body('cote')
    .trim()
    .notEmpty().withMessage('La cote est requise.')
    .matches(/^\d{2}-\d{2}-\d{4}$/).withMessage('Format de cote invalide (attendu: 04-01-1785).'),
  body('isbn')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('ISBN trop long.'),
  body('authors')
    .custom((value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return false;
    }).withMessage('Au moins un auteur est requis.'),
  body('category')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_CATEGORIES).withMessage('Catégorie invalide.'),
  body('language')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_LANGUAGES).withMessage('Langue invalide.'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 5000 }).withMessage('Description trop longue.'),
  body('publisher')
    .optional({ checkFalsy: true })
    .isLength({ max: 300 }).withMessage('Nom d\'éditeur trop long.'),
  body('publicationYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Année de publication invalide.'),
  body('pages')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Nombre de pages invalide.'),
  body('availableCopies')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Nombre d\'exemplaires disponibles invalide.'),
  body('totalCopies')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Nombre total d\'exemplaires invalide.'),
  body('coverImage')
    .optional({ checkFalsy: true })
    .isLength({ max: 2000 }).withMessage('URL de couverture trop longue.'),
];

const updateBookValidator = [
  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Le titre est trop long.'),
  body('cote')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{2}-\d{2}-\d{4}$/).withMessage('Format de cote invalide (attendu: 04-01-1785).'),
  body('isbn')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('ISBN trop long.'),
  body('category')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_CATEGORIES).withMessage('Catégorie invalide.'),
  body('language')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_LANGUAGES).withMessage('Langue invalide.'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 5000 }).withMessage('Description trop longue.'),
  body('publicationYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Année de publication invalide.'),
  body('pages')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Nombre de pages invalide.'),
  body('availableCopies')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Nombre d\'exemplaires disponibles invalide.'),
  body('totalCopies')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Nombre total d\'exemplaires invalide.'),
];

// Basic guardrails on search/list query params (mainly caps pagination so a
// client can't request an absurd limit and force a huge in-memory payload).
const searchBooksValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('yearFrom').optional().isInt({ min: 1000 }).toInt(),
  query('yearTo').optional().isInt({ min: 1000 }).toInt(),
];

const listBooksValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  createBookValidator,
  updateBookValidator,
  searchBooksValidator,
  listBooksValidator,
};
