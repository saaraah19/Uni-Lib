const Book = require("../models/Book");
const Favorite = require("../models/Favorite");
const { getOrSet, invalidatePrefix } = require("../utils/simpleCache");
const logger = require("../utils/logger");

const CACHE_PREFIX = "books:";
const invalidateBooksCache = () => invalidatePrefix(CACHE_PREFIX);

// SECURITY/PERF FIX (P0): escape regex metacharacters to prevent ReDoS and
// to avoid unintended pattern behavior when user input is used inside
// $regex.
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createBook = async (req, res) => {
  try {
    const {
      title,
      title_original,
      authors,
      author_original,
      isbn,
      cote,
      category,
      publisher,
      publicationYear,
      publishedDate,
      description,
      coverImage,
      availableCopies,
      totalCopies,
      language,
      pages,
    } = req.body;

    // Traitement des auteurs
    let processedAuthors = authors;
    if (typeof authors === "string") {
      processedAuthors = [authors.trim()];
    } else if (
      Array.isArray(authors) &&
      authors.length === 1 &&
      typeof authors[0] === "string" &&
      authors[0].includes(",")
    ) {
      processedAuthors = authors[0]
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
    }

    // Vérification ISBN (si fourni)
    if (isbn) {
      const existingBook = await Book.findOne({ isbn: isbn });
      if (existingBook) {
        console.log("❌ ISBN déjà existant:", isbn);
        return res.status(400).json({ message: "ISBN ALREADY EXISTS" });
      }
    }

    // Extraction des infos de cote si la cote est fournie
    let cote_info = {};
    if (cote) {
      const coteParts = cote.split("-");
      cote_info = {
        section: coteParts[0] || "",
        category_code: coteParts[1] || "",
        id_number: coteParts[2] || "",
      };
    }

    // Création du livre avec TOUS les champs possibles
    const newBook = new Book({
      title,
      title_original,
      authors: processedAuthors,
      author_original,
      isbn,
      cote,
      cote_info,
      category: category || "Non Categorized",
      publisher,
      publicationYear,
      publishedDate,
      description,
      coverImage:
        coverImage || "https://via.placeholder.com/300x400?text=Livre",
      availableCopies: availableCopies || 1,
      totalCopies: totalCopies || availableCopies || 1,
      isAvailable: (availableCopies || 1) > 0,
      language,
      pages,
      enriched: !!(isbn && description && publisher && publicationYear),
      enrichedAt:
        isbn && description && publisher && publicationYear ? new Date() : null,
    });

    await newBook.save();
    logger.debug("✅ Livre sauvegardé avec succès!");
    invalidateBooksCache();

    res.status(201).json({
      message: "Book Created Successfully",
      book: newBook,
    });
  } catch (error) {
    logger.error("❌ ERREUR DÉTAILLÉE:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Cette cote existe déjà" });
    }
    res
      .status(500)
      .json({ message: "erreur lors de la creation du nouveau livre" });
  }
};

// PERF FIX (P1): this endpoint used to return the entire ~11k-document
// collection unconditionally. It now supports the same page/limit
// pagination pattern as /search, with a bounded default page size so
// existing callers that don't pass params get a safe response instead of
// the full dataset. Prefer /books/search for filtered/sorted access; this
// endpoint remains for simple paginated listing.
const readAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [retrievedBooks, total] = await Promise.all([
      Book.find().skip(skip).limit(limit),
      Book.countDocuments(),
    ]);

    logger.debug("📖 Livres trouvés:", retrievedBooks.length, "/", total);

    res.status(200).json({
      success: true,
      count: retrievedBooks.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: retrievedBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readOneBook = async (req, res) => {
  try {
    const id = req.params.id;
    const readBook = await Book.findOne({ _id: id });
    if (!readBook) {
      return res.status(404).json({ message: "book not found" });
    }

    res.status(200).json(readBook);
  } catch (error) {
    console.error("❌ Error fetching book:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const userUpdates = req.body;

    const updatedBook = await Book.findByIdAndUpdate(id, userUpdates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Livre non trouvé",
      });
    }
    invalidateBooksCache();
    res.status(200).json({
      success: true,
      message: "Livre mis à jour avec succès",
      book: updatedBook,
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DATA INTEGRITY FIX (P1): deleting a book previously left orphaned
// references behind — Favorite documents pointing at a now-nonexistent
// book (which crashes FavoritesPage.js, since it assumes item.book is
// always populated). We now remove dangling Favorite entries as part of
// the delete. Loan records are intentionally left untouched (audit/history
// value); their populated `book` field is already handled defensively in
// getAllLoans.
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findOneAndDelete({ _id: id });

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "Livre non trouvé",
      });
    }

    const { deletedCount } = await Favorite.deleteMany({ book: id });
    if (deletedCount > 0) {
      console.log(`🧹 ${deletedCount} favori(s) orphelin(s) nettoyé(s) pour le livre ${id}`);
    }
    invalidateBooksCache();

    res.status(200).json({
      success: true,
      message: "Livre supprimé avec succès",
      book: deletedBook,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchBooks = async (req, res) => {
  try {
    const {
      q,
      author,
      category,
      cote,
      isAvailable,
      yearFrom,
      yearTo,
      enriched,
      languages,
      page = 1,
      limit = 20,
      sortBy = "title",
      order = "asc",
    } = req.query;

    let filter = {};
    let useTextScore = false;

    if (q && q.trim().length > 0) {
      const trimmed = q.trim();
      if (trimmed.length >= 3) {
        filter.$text = { $search: trimmed };
        useTextScore = true;
      } else {
        const safeQ = escapeRegex(trimmed);
        filter.$or = [
          { title: { $regex: safeQ, $options: "i" } },
          { title_original: { $regex: safeQ, $options: "i" } },
          { cote: { $regex: safeQ, $options: "i" } },
        ];
      }
    }

    if (author) {
      filter.authors = { $regex: escapeRegex(author), $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (languages) {
      const langArray = Array.isArray(languages)
        ? languages
        : languages.split(",").map((l) => l.trim());

      if (langArray.length > 0) {
        filter.language = { $in: langArray };
      }
    }

    if (cote) {
      filter.cote = { $regex: escapeRegex(cote), $options: "i" };
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    if (enriched !== undefined) {
      filter.enriched = enriched === "true";
    }

    if (yearFrom || yearTo) {
      filter.publicationYear = {};
      if (yearFrom) filter.publicationYear.$gte = parseInt(yearFrom);
      if (yearTo) filter.publicationYear.$lte = parseInt(yearTo);
    }

    let sort = {};
    const sortOrder = order === "desc" ? -1 : 1;

    if (useTextScore && sortBy === "title") {
      sort = { score: { $meta: "textScore" } };
    } else {
      const sortFields = {
        title: { title: sortOrder },
        year: { publicationYear: sortOrder },
        recent: { createdAt: -1 },
        author: { authors: sortOrder },
        cote: { cote: sortOrder },
      };
      sort = sortFields[sortBy] || sortFields.title;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = Book.find(
      filter,
      useTextScore ? { score: { $meta: "textScore" } } : undefined
    );
    query = query.sort(sort).skip(skip).limit(limitNum);

    const books = await query;
    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: books,
    });
  } catch (error) {
    console.error("❌ Erreur dans searchBooks:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche avancée",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    // PERF FIX (P2): cached for 5 minutes — the category list changes only
    // when a book is created/updated/deleted, and this endpoint was
    // previously hit on every catalog/filter render.
    const filteredCategories = await getOrSet(
      `${CACHE_PREFIX}categories`,
      5 * 60 * 1000,
      async () => {
        const categories = await Book.distinct("category");
        return categories.filter((cat) => cat != null).sort();
      }
    );

    res.status(200).json({
      success: true,
      count: filteredCategories.length,
      data: filteredCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des catégories",
      error: error.message,
    });
  }
};

const getLanguages = async (req, res) => {
  try {
    // PERF FIX (P2): cached for 5 minutes, same reasoning as getCategories.
    const languagesWithNames = await getOrSet(
      `${CACHE_PREFIX}languages`,
      5 * 60 * 1000,
      async () => {
        const languages = await Book.distinct("language");
        const filteredLanguages = languages.filter((lang) => lang != null).sort();
        const languageNames = { en: "English", fr: "Français", es: "Español" };
        return filteredLanguages.map((code) => ({
          code,
          name: languageNames[code] || code,
        }));
      }
    );

    res.status(200).json({
      success: true,
      count: languagesWithNames.length,
      data: languagesWithNames,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des langues",
      error: error.message,
    });
  }
};

const getBookStats = async (req, res) => {
  try {
    // PERF FIX (P2): this was the most expensive endpoint (3 countDocuments
    // + 2 aggregations) and was called on every BooksCrud/dashboard render
    // with zero caching. Cached for 2 minutes — short enough that staff
    // still see reasonably fresh numbers, long enough to absorb repeated
    // renders/navigations within the same work session.
    const stats = await getOrSet(
      `${CACHE_PREFIX}stats`,
      2 * 60 * 1000,
      async () => {
        const totalBooks = await Book.countDocuments();
        const enrichedBooks = await Book.countDocuments({ enriched: true });
        const availableBooks = await Book.countDocuments({ isAvailable: true });

        const categoryStats = await Book.aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              available: { $sum: { $cond: ["$isAvailable", 1, 0] } },
            },
          },
          { $sort: { count: -1 } },
        ]);

        const yearStats = await Book.aggregate([
          { $match: { publicationYear: { $ne: null } } },
          { $group: { _id: "$publicationYear", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
          { $limit: 10 },
        ]);

        return {
          totalBooks,
          enrichedBooks,
          nonEnrichedBooks: totalBooks - enrichedBooks,
          availableBooks,
          unavailableBooks: totalBooks - availableBooks,
          enrichmentRate:
            totalBooks > 0
              ? ((enrichedBooks / totalBooks) * 100).toFixed(2) + "%"
              : "0%",
          categories: categoryStats,
          topYears: yearStats,
        };
      }
    );

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des statistiques",
      error: error.message,
    });
  }
};

const getBookByCote = async (req, res) => {
  try {
    const book = await Book.findOne({ cote: req.params.cote });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Livre non trouvé avec cette cote",
      });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du livre",
      error: error.message,
    });
  }
};

const getRecentBooks = async (req, res) => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 10;
    const books = await Book.find().sort({ createdAt: -1 }).limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des livres récents",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  readAllBooks,
  readOneBook,
  updateBook,
  getBookStats,
  getCategories,
  getLanguages,
  deleteBook,
  getRecentBooks,
  getBookByCote,
  searchBooks,
};
