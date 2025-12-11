"use client";

import { useState, useCallback } from "react";
import { gamesAPI } from "../data/games";

export function useGames() {
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch games with filters
  const fetchGames = useCallback(async (page = 1, filters = {}, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search: filters.search || "",
        // country: filters.country && filters.country !== "all" ? filters.country : "", // Commented out
        sdkProvider: filters.sdk && filters.sdk !== "all" ? filters.sdk : "",
        xpTier:
          filters.xpTier && filters.xpTier !== "all" && filters.xpTier !== "All" ? filters.xpTier : "",
        adGame:
          filters.adGame && filters.adGame !== "all" ? filters.adGame : "",
        status:
          filters.status && filters.status !== "all"
            ? filters.status.toLowerCase()
            : "all",
        gender: filters.gender && filters.gender !== "all" ? filters.gender : "",
      };

      const response = await gamesAPI.getGames(params);

      setGames(response.games);
      setPagination(response.pagination);
    } catch (err) {
      setError("Failed to load games. Please try again.");
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create game
  const createGame = useCallback(async (gameData) => {
    setLoading(true);
    setError(null);

    try {
      const newGame = await gamesAPI.createGame(gameData);
      setGames((prev) => [...prev, newGame]);
      return newGame;
    } catch (err) {
      setError("Failed to create game. Please try again.");
      console.error("Error creating game:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update game
  const updateGame = useCallback(async (gameId, gameData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedGame = await gamesAPI.updateGame(gameId, gameData);
      setGames((prev) =>
        prev.map((game) => (game.id === gameId ? updatedGame : game))
      );
      return updatedGame;
    } catch (err) {
      setError("Failed to update game. Please try again.");
      console.error("Error updating game:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete game
  const deleteGame = useCallback(async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      await gamesAPI.deleteGame(gameId);
      setGames((prev) => prev.filter((game) => game.id !== gameId));
      return true;
    } catch (err) {
      setError("Failed to delete game. Please try again.");
      console.error("Error deleting game:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single game by ID
  const getGameById = useCallback(async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      const game = await gamesAPI.getGameById(gameId);
      return game;
    } catch (err) {
      setError("Failed to load game. Please try again.");
      console.error("Error fetching game:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    games,
    pagination,
    loading,
    error,
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
    getGameById,
  };
}
