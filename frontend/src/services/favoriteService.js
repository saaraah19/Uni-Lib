import api from "./api";

export const favoriteService = {
  // Add book to favorites
  addToFavorites: async (bookId) => {
    try {
      const response = await api.post("/favorites", { bookId });
      // Dispatch event AFTER successful addition
      window.dispatchEvent(
        new CustomEvent("favoriteUpdated", {
          detail: { action: "add", bookId },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        "Add to favorites error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Remove book from favorites
  removeFromFavorites: async (bookId) => {
    try {
      const response = await api.delete(`/favorites/${bookId}`);
      // Dispatch event AFTER successful removal
      window.dispatchEvent(
        new CustomEvent("favoriteUpdated", {
          detail: { action: "remove", bookId },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(
        "Remove from favorites error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get user's favorites
  getUserFavorites: async () => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      console.error(
        "Get favorites error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Check if book is favorite
  checkIsFavorite: async (bookId) => {
    try {
      const response = await api.get(`/favorites/check/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Check favorite error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Get favorite count
  getFavoriteCount: async () => {
    
    try {
      const response = await api.get("/favorites/count");

      return response.data;
    } catch (error) {
      console.error("📚 ERROR in getFavoriteCount:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        tokenExists: !!localStorage.getItem("token"),
      });
      throw error;
    }
  },
};
