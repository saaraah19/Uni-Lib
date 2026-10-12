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
const path = require("path");
const fs = require("fs");


// Création de l'application Express
const app = express();
// SINGLE-SERVICE HOSTING: in production Express also serves the React build (see
  // "FRONTEND" below), so the browser loads the page and calls the API from the same
  // origin. Helmet's default Content-Security-Policy would block two things the SPA
  // needs: book covers hosted on other sites (img-src) and the landing hero photo.
  // Everything else keeps Helmet's strict defaults (scripts: same-origin only; the
  // app has no inline scripts — see frontend/public/boot.js).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https:'],
        'upgrade-insecure-requests': null, // Render already serves HTTPS; keeps local prod tests on http working
      },
    },
  })
);

// RENDER/PROXY FIX: in production the API sits behind Render's reverse
// proxy, so every request reaches Node from the proxy's IP. Without this
// setting, req.ip is the proxy's address for ALL visitors — which means the
// login/register rate limiter (5 attempts / 15 min) would be shared by every
// user of the site (five failed logins from anyone would lock everybody
// out), and express-rate-limit logs an X-Forwarded-For validation error.
// "1" = trust exactly one proxy hop (Render's), so req.ip is the real client.
app.set('trust proxy', 1);


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

// ========== HEALTH CHECK ==========
// COLD-START SUPPORT: lightweight endpoint, no auth, no heavy DB query.
// Used by (1) the frontend warm-up (services/serverWarmup.js) to detect
// when a sleeping Render instance is awake again, (2) Render's
// healthCheckPath, and (3) an optional external uptime pinger.
app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    db: dbUp ? 'up' : 'down',
    uptime: Math.round(process.uptime()),
  });
});

// ========== FRONTEND (single-service hosting) ==========
// If the React app has been built (frontend/build), serve it from this same
// server. Hashed files under /static are cached for a year; index.html is never
// cached so a new deploy is picked up immediately. When there is no build (local
// API-only development) the JSON welcome route below is used instead.
const clientBuild = path.join(__dirname, '..', 'frontend', 'build');
const hasClientBuild = fs.existsSync(path.join(clientBuild, 'index.html'));
if (hasClientBuild) {
  app.use(
    express.static(clientBuild, {
      index: false,
      setHeaders: (res, filePath) => {
        const immutable = filePath.includes(`${path.sep}static${path.sep}`);
        res.setHeader(
          'Cache-Control',
          immutable ? 'public, max-age=31536000, immutable' : 'no-cache'
        );
      },
    })
  );
}

// ========== ROUTES DE BASE ==========
if (!hasClientBuild) {
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
}


// ========== ROUTES USER  ==========
app.use('/api/users',userRoutes);

// ========== ROUTES BOOK  ==========
app.use('/api/books',bookRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/loans',loanRoute);

app.use('/api/stats', statsRoutes);

// SPA fallback: any non-API GET (e.g. a refresh on /login or /student-dashboard)
// returns index.html so React Router can handle the route. /api/* never falls
// through here — unknown API routes still get the JSON 404 below.
if (hasClientBuild) {
  // /static/* is excluded: a missing hashed asset (e.g. a stale chunk after a redeploy)
  // must be a real 404, not an HTML page served as JavaScript.
  app.get(/^\/(?!api(\/|$)|static\/).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

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