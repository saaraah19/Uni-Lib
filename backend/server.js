// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoute');
const bookRoutes = require('./routes/bookRoute')
require('dotenv').config();
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/NotificationRoute');
const loanRoute = require('./routes/loanRoute')
const statsRoutes = require('./routes/stats'); 
require('./reminderService');
const helmet = require("helmet");


// Création de l'application Express
const app = express();
app.use(helmet());


const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); 

// ========== BASE DE DONNÉES ==========
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    console.log('📁 Nom de la base connectée :', mongoose.connection.name);
    // Liste les collections présentes dans cette base
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections disponibles :', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1); // Arrête le serveur si pas de DB
  }
};

// ========== ROUTES DE BASE ==========
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue à la Librairie Universitaire API',
    version: '1.0.0',
    routes: {
      books: '/api/books',
      users: '/api/users',
      auth: '/api/auth'
    }
  });
});


// ========== ROUTES USER  ==========
app.use('/api/users',userRoutes);

// ========== ROUTES BOOK  ==========
app.use('/api/books',bookRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/loans',loanRoute);

app.use('/api/stats', statsRoutes);

// ========== GESTION DES ERREURS ==========
// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Quelque chose a mal tourné !' });
});

// ========== DÉMARRAGE DU SERVEUR ==========
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Connecte à MongoDB
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
};

startServer();