"use client";

import apiClient from "../lib/apiClient";

const unwrap = (response) => response.data?.data;

export const walkathonAPI = {
  async getChallenges() {
    const response = await apiClient.get("/admin/walkathon/challenges", {
      params: { page: 1, limit: 50 },
    });
    return unwrap(response);
  },

  async syncLifecycle() {
    const response = await apiClient.post("/admin/walkathon/sync-lifecycle");
    return unwrap(response);
  },

  async activate(id) {
    const response = await apiClient.post(
      `/admin/walkathon/challenges/${id}/activate`,
    );
    return unwrap(response);
  },
};
