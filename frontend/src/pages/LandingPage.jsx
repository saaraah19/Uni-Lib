import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaSignInAlt, FaUserPlus, FaChevronDown, FaUniversity } from 'react-icons/fa';

/**
 * LandingPage
 *
 * Page publique affichée à la racine "/" pour les visiteurs non connectés
 * (les utilisateurs déjà connectés continuent d'être redirigés directement
 * vers leur dashboard — voir App.jsx / NavigateToDashboard).
 *
 * UI FIX : le logo de l'université apparaissait deux fois (petit dans le
 * header en haut à gauche, et en grand centré dans le hero) — redondant et
 * visuellement chargé. Un seul logo est conservé désormais : celui du
 * header, toujours visible et discret. Le hero affiche uniquement le nom
 * de la faculté en texte, sans doublon visuel.
 *
 * PERSONNALISATION :
 * - Remplace HERO_IMAGE_URL par l'URL d'une vraie photo de bibliothèque
 *   (idéalement celle de la fac elle-même, en 1920px de large minimum).
 * - Remplace UNIVERSITY_LOGO_URL par le logo de la faculté/université
 *   (fond transparent recommandé, PNG/SVG).
 * - Ajuste FACULTY_NAME et le texte d'accueil selon l'établissement réel.
 * - Complète/adapte les entrées de FAQ_ITEMS selon les vraies règles de la
 *   bibliothèque (durée de prêt, nombre de prêts simultanés, etc.).
 */

// TODO: remplacer par une vraie image (voir note ci-dessus)
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=1920&auto=format&fit=crop';
// Logo de l'Université Oran 2 Mohamed Ben Ahmed — placer le fichier
// logo-oran2.jpg dans frontend/public/ (fourni par l'utilisateur).
const UNIVERSITY_LOGO_URL = '/logo-oran2.jpg';
const FACULTY_NAME = 'Faculté des Langues Étrangères — Université Oran 2 Mohamed Ben Ahmed';

const FAQ_ITEMS = [
  {
    question: "Qui peut emprunter des livres à la bibliothèque ?",
    answer: "Tous les étudiants et le personnel de la faculté disposant d'un compte UniLib actif. L'inscription se fait avec votre email universitaire.",
  },
  {
    question: "Combien de livres puis-je emprunter en même temps ?",
    answer: "Un maximum de 5 prêts simultanés par compte étudiant, pour une durée standard de 30 jours (renouvelable selon disponibilité).",
  },
  {
    question: "Comment savoir si un livre est disponible ?",
    answer: "Le catalogue affiche en temps réel le nombre d'exemplaires disponibles pour chaque livre. Vous pouvez filtrer par catégorie, langue, auteur ou cote.",
  },
  {
    question: "Que se passe-t-il si je rends un livre en retard ?",
    answer: "Une pénalité s'applique par jour de retard au-delà de la date d'échéance. Vous recevez une notification 3 jours avant l'échéance pour l'éviter.",
  },
  {
    question: "Comment devenir membre du personnel de la bibliothèque ?",
    answer: "Les comptes staff sont créés uniquement par un membre du personnel déjà en poste, depuis l'espace d'administration. Contactez la bibliothèque directement pour toute demande.",
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 text-left"
    >
      <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">
        {item.question}
      </span>
      <FaChevronDown
        className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="px-4 sm:px-5 pb-3 sm:pb-4 text-sm text-gray-600 dark:text-gray-400">
        {item.answer}
      </div>
    )}
  </div>
);

const LandingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* ================================================== */}
      {/* NAVBAR SIMPLE (pas la Navbar app - pas encore connecté) */}
      {/* ================================================== */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {UNIVERSITY_LOGO_URL ? (
              <div className="bg-white/95 rounded-lg px-2 py-1 shadow-md">
                <img src={UNIVERSITY_LOGO_URL} alt="Logo Université Oran 2" className="h-7 sm:h-9 w-auto" />
              </div>
            ) : (
              <FaUniversity className="text-2xl sm:text-3xl text-white" />
            )}
            <span className="font-semibold text-sm sm:text-base hidden xs:inline text-white">UniLib</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:text-blue-200 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white/90 hover:bg-white text-blue-700 rounded-lg transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}
      <section
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      >
        {/* Overlay pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          {/* UI FIX : le gros logo centré (doublon avec celui du header) a
              été retiré ici. Le nom de la faculté seul suffit à ancrer
              l'identité visuelle sans répéter le logo. */}
          <p className="uppercase tracking-widest text-xs sm:text-sm text-blue-200 mb-3 sm:mb-4 font-medium">
            {FACULTY_NAME}
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Bienvenue à la Bibliothèque<br className="hidden sm:block" /> de votre Faculté
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Explorez notre catalogue, réservez vos emprunts et suivez vos prêts
            en un seul endroit — conçu pour les étudiants et le personnel de
            la faculté.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
            >
              <FaSignInAlt />
              Se connecter
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-sm sm:text-base backdrop-blur-sm transition-all"
            >
              <FaUserPlus />
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce">
          <FaChevronDown className="text-xl" />
        </div>
      </section>

      {/* ================================================== */}
      {/* SECTION "POURQUOI UNILIB" */}
      {/* ================================================== */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FaBook className="text-2xl sm:text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 text-sm sm:text-base">
                Catalogue complet
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Des milliers d'ouvrages, filtrables par catégorie, langue et disponibilité.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">📋</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 text-sm sm:text-base">
                Suivi de vos prêts
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Consultez vos emprunts en cours, votre historique, et recevez des rappels avant l'échéance.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">❤️</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 text-sm sm:text-base">
                Vos favoris
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Enregistrez les ouvrages qui vous intéressent pour les retrouver facilement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FAQ */}
      {/* ================================================== */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Questions fréquentes
          </h2>
          <p className="text-sm sm:text-base text-center text-gray-500 dark:text-gray-400 mb-8 sm:mb-10">
            Tout ce qu'il faut savoir avant de commencer
          </p>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem
                key={index}
                item={item}
                isOpen={openFaqIndex === index}
                onToggle={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER / CTA FINAL */}
      {/* ================================================== */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 bg-gray-900 dark:bg-black text-center">
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          {FACULTY_NAME} • Bibliothèque Universitaire
        </p>
        <div className="flex justify-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            S'inscrire
          </Link>
        </div>
        <p className="text-gray-600 text-2xs sm:text-xs mt-6">
          © {new Date().getFullYear()} UniLib. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
