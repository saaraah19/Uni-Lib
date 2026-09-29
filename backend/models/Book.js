const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    // === INFORMATIONS DE BASE ===
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true, // Pour recherche rapide
    },
    
    // Titre original du fichier (avant nettoyage)
    title_original: {
      type: String,
      trim: true,
    },
    
    // === IDENTIFIANTS ===
    isbn: {
      type: String,
      trim: true,
      sparse: true, // Permet null/undefined
      // Note: On retire unique true car beaucoup de livres n'ont pas d'ISBN
    },
    
    cote: {
      type: String,
      required: [true, "Cote is required"], // Dans une bibliothèque, c'est essentiel !
      unique: true,
      trim: true,
      index: true,
    },
    
    // Informations extraites de la cote (optionnel mais utile)
    cote_info: {
      section: String,      // 04
      category_code: String, // 01
      id_number: String      // 1785
    },
    
    // === AUTEURS ===
    authors: [{
      type: String,
      required: [true, "Author is required"],
      trim: true,
    }],
    
    // Auteur original du fichier (en majuscules, etc.)
    author_original: {
      type: String,
      trim: true,
    },
    
    // === CATÉGORIE ===
    category: {
      type: String,
      enum: [
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
        "général"
      ],
      required: true,
      default: "Non Categorized",
      index: true,
    },
    
    // Catégories Google Books (pour enrichissement)
    google_categories: [{
      type: String
    }],
    
    // === ÉDITEUR ET PUBLICATION ===
    publisher: {
      type: String,
      trim: true,
    },
    
    publicationYear: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear(),
    },
    
    publishedDate: {
      type: String, // Format original de Google Books
    },
    
    // === DESCRIPTION ===
    description: {
      type: String,
      trim: true,
    },
    
    // === MÉTADONNÉES PHYSIQUES ===
    pages: {
      type: Number,
      min: 0,
    },
    
    language: {
      type: String,
      enum: ["en", "fr", "es"], // English, French, Spanish
      default: "fr",
      trim: true,
      index: true,
    },
    
    // === IMAGE ===
    coverImage: {
      type: String,
      default: "https://via.placeholder.com/300x400?text=Livre",
    },
    
    // === GESTION DES EXEMPLAIRES ===
    availableCopies: {
      type: Number,
      default: 1,
      min: 0,
    },
    
    totalCopies: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    isAvailable: {
      type: Boolean,
      default: true,
    },
    
    // === MÉTADONNÉES D'ENRICHISSEMENT ===
    enriched: {
      type: Boolean,
      default: false,
    },
    
    enrichedAt: {
      type: Date,
    },
    
    // === INFORMATIONS COMPLÉMENTAIRES ===
    subtitle: {
      type: String,
      trim: true,
    },
    
    // Pour stocker d'autres infos de Google Books
    extra: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // createdAt et updatedAt automatiques
  }
);

// === INDEX COMPOSÉS POUR RECHERCHES AVANCÉES ===
BookSchema.index({ title: 'text', description: 'text' }); // Recherche plein texte
BookSchema.index({ category: 1, publicationYear: -1 }); // Filtrer par catégorie/année
BookSchema.index({ authors: 1 }); // Recherche par auteur

// === VIRTUELS (propriétés calculées) ===
BookSchema.virtual('displayTitle').get(function() {
  return this.title || this.title_original || 'Titre inconnu';
});

BookSchema.virtual('mainAuthor').get(function() {
  return this.authors && this.authors.length > 0 ? this.authors[0] : 'Auteur inconnu';
});

// === MIDDLEWARE (s'exécute avant save) ===
BookSchema.pre('save', async function() {
  // Mettre à jour isAvailable en fonction des copies disponibles
  this.isAvailable = this.availableCopies > 0;
  
  // Extraire les infos de la cote si présente
  if (this.cote) {
    const parts = this.cote.split('-');
    if (parts.length >= 3) {
      this.cote_info = {
        section: parts[0],
        category_code: parts[1],
        id_number: parts.slice(2).join('-')
      };
    }
  }
});

// === MÉTHODES D'INSTANCE ===
BookSchema.methods.borrow = function() {
  if (this.availableCopies > 0) {
    this.availableCopies -= 1;
    return true;
  }
  return false;
};

BookSchema.methods.return = function() {
  if (this.availableCopies < this.totalCopies) {
    this.availableCopies += 1;
    return true;
  }
  return false;
};

// === MÉTHODES STATIQUES ===
BookSchema.statics.findByCote = function(cote) {
  return this.findOne({ cote: cote });
};

BookSchema.statics.findByCategory = function(category) {
  return this.find({ category: category });
};

BookSchema.statics.search = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

module.exports = mongoose.model("Book", BookSchema);