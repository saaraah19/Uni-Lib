import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === "staff") {
          navigate("/staff-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } catch (error) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email.trim(),
        password: password,
      });
      // const { user, token } = response.data;
      const user = response.data.user;
      const token = user.token; // ← Get token from user object!

      console.log("🔐 3. Token variable:", token);

      // ============== CRITICAL FIX ==============
      // Ensure we have ALL fields needed for the profile
      const userToStore = {
        id: user.id || user._id,
        name: user.name || user.username,
        email: user.email || email.trim(), // Use the email they entered!
        role: user.role,
        userCode: user.userCode || "Code not assigned", // Will be updated later if needed
        createdAt: user.createdAt || new Date().toISOString(),
        token: token,
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userToStore));
      console.log(
        "🔐 5. Token in localStorage AFTER set:",
        localStorage.getItem("token"),
      );

      // Set token in API headers immediately
      api.defaults.headers.common["Authorization"] = "Bearer " + token;

      window.dispatchEvent(
        new CustomEvent("authChange", {
          detail: { isLoggedIn: true, user: userToStore },
        }),
      );

      toast.success("Connexion réussie !");

      if (userToStore.role === "staff") {
        navigate("/staff-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      console.error("Erreur login:", error);
      toast.error(error.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300 px-4 py-8">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full sm:w-96 transition-colors duration-300">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-gray-100">
          Connexion
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
              <FaEnvelope className="ml-3 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 outline-none bg-transparent text-gray-900 dark:text-gray-100 text-sm"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
              <FaLock className="ml-3 text-gray-400 dark:text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 outline-none bg-transparent text-gray-900 dark:text-gray-100 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded flex items-center justify-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              "Connexion..."
            ) : (
              <>
                <FaSignInAlt className="mr-2" />
                Se connecter
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Pas de compte ?{" "}
          <Link
            to="/Register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            S'inscrire
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
