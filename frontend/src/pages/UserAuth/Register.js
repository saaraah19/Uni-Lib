import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🎯 ICI : Ton appel à l'API register !
      const response = await api.post('/users/register', formData);
      console.log("Response from the backend",response)
      toast.success('Inscription réussie ! Vous pouvez vous connecter.');
      navigate('/login'); // Redirige vers login

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md p-6 sm:p-8 transition-colors duration-300">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 sm:mb-4 transition-colors duration-300">
            <FaUserPlus className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Créer un compte</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Rejoignez la bibliothèque universitaire</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* Nom complet */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded transition-colors duration-300">
              <FaUser className="ml-3 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">Email universitaire</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded transition-colors duration-300">
              <FaEnvelope className="ml-3 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="etudiant@universite.edu"
                required
              />
            </div>
          </div>


          {/* Mot de passe */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">Mot de passe</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded transition-colors duration-300">
              <FaLock className="ml-3 text-gray-400 dark:text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Minimum 6 caractères"
                minLength="6"
                required
              />
            </div>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 sm:p-3 text-sm sm:text-base rounded font-semibold transition-colors ${loading 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>

        </form>

        {/* Lien vers login */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Se connecter
            </Link>
          </p>

          {/*
            REMOVED (sécurité, cf. décision B-1 de l'audit) : le bloc
            "Pour le staff : Utilisez @librairie.edu..." annonçait un
            mécanisme d'auto-attribution du rôle staff par domaine email qui
            a été retiré côté backend (UserController.js) car exploitable —
            aucune vérification de propriété de l'email n'existe dans
            l'app. Les nouveaux comptes staff sont désormais créés via
            promotion manuelle par un membre du staff existant
            (PUT /api/users/:id/promote-to-staff), pas via l'inscription
            publique. Laisser ce message ici aurait été trompeur (il
            n'aurait plus eu aucun effet) et aurait pu inciter des gens à
            essayer un email qu'ils ne possèdent pas.
          */}
        </div>
      </div>
    </div>
  );
};

export default Register;
