'use client';

import apiClient from '../lib/apiClient';

/**
 * Client games integrated through Adjust.
 *
 * The game itself is created in Games Listing like any other game. Its tasks use
 * the same task endpoints as partner games; `externalTaskId` holds the task's
 * Adjust event token. Everything Adjust-specific lives under
 * /admin/direct-games.
 */

/** Reads the server's message from an axios error, for toasts. */
export const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.join?.(', ') ||
  error?.response?.data?.error ||
  fallback;

export const directGamesAPI = {
  async listGames() {
    const response = await apiClient.get('/admin/direct-games/games');
    return response.data.data;
  },

  async getValidation(gameId) {
    const response = await apiClient.get(`/admin/direct-games/games/${gameId}/validation`);
    return response.data.data;
  },

  /** @param {{adjustAppToken, trackerUrl, packageName, storeUrl, iconUrl}} config */
  async saveConfig(gameId, config) {
    const response = await apiClient.put(`/admin/direct-games/games/${gameId}/config`, config);
    return response.data.data;
  },

  async setRewardsEnabled(gameId, enabled) {
    const response = await apiClient.patch(`/admin/direct-games/games/${gameId}/rewards`, { enabled });
    return response.data.data;
  },

  // Tasks - shared game task endpoints

  async listTasks(gameId) {
    const response = await apiClient.get(`/admin/game-offers/games/${gameId}/tasks`, {
      params: { limit: 200 },
    });
    return response.data.data.tasks;
  },

  async createTask(gameId, task) {
    const response = await apiClient.post(`/admin/game-offers/games/${gameId}/tasks`, task);
    return response.data.data;
  },

  async updateTask(taskId, task) {
    const response = await apiClient.put(`/admin/game-offers/tasks/${taskId}`, task);
    return response.data.data;
  },

  async deleteTask(taskId) {
    const response = await apiClient.delete(`/admin/game-offers/tasks/${taskId}`);
    return response.data;
  },

  /** Marking types here is what lets a task count toward purchase/milestone challenges. */
  async setTaskClassification(taskId, eventTypes) {
    const response = await apiClient.patch(`/admin/game-offers/tasks/${taskId}/classification`, { eventTypes });
    return response.data.data;
  },

  // Events and review queue

  async listEvents(params = {}) {
    const query = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const response = await apiClient.get('/admin/direct-games/events', { params: query });
    return response.data.data;
  },

  async getEvent(eventId) {
    const response = await apiClient.get(`/admin/direct-games/events/${eventId}`);
    return response.data.data;
  },

  /** @param {{userId?, taskId?, note?}} decision */
  async creditEvent(eventId, decision) {
    const response = await apiClient.post(`/admin/direct-games/events/${eventId}/credit`, decision);
    return response.data;
  },

  async rejectEvent(eventId, note) {
    const response = await apiClient.post(`/admin/direct-games/events/${eventId}/reject`, { note });
    return response.data;
  },

  async retryEvent(eventId) {
    const response = await apiClient.post(`/admin/direct-games/events/${eventId}/retry`);
    return response.data;
  },

  async getSummary(params = {}) {
    const response = await apiClient.get('/admin/direct-games/reports/summary', { params });
    return response.data.data;
  },
};
