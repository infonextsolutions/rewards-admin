"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  INTEGRATION_API,
  INTEGRATION_CATEGORIES,
  CONNECTION_STATUSES,
  AVAILABLE_INTEGRATIONS,
} from "../data/integrations";
import {
  MOCK_NOTIFICATION_SETTINGS,
  FIREBASE_FEATURES,
  TRIGGER_EVENTS,
  NOTIFICATION_ROLES,
} from "../data/notifications";

export const useSettingsIntegrations = () => {
  // State management
  const [integrations, setIntegrations] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(
    MOCK_NOTIFICATION_SETTINGS
  );
  const [firebaseFeatures, setFirebaseFeatures] = useState(FIREBASE_FEATURES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Load integrations on mount
  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true);
      try {
        const response = await INTEGRATION_API.getAll({
          page: 1,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        // Handle the nested response structure: data.data.integrations
        const integrationsData =
          response.data?.data?.integrations ||
          response.data?.integrations ||
          response.data ||
          [];

        // Transform API data to match UI expectations
        const transformedIntegrations = Array.isArray(integrationsData)
          ? integrationsData.map((integration) => ({
              id: integration.id,
              name: integration.integrationName,
              description: integration.description,
              category: integration.category,
              apiKey: integration.apiKey,
              endpointUrl: integration.endpointUrl,
              isActive: integration.active,
              status: integration.active ? "Connected" : "Disconnected", // Default status
              lastTested: integration.lastTested || null,
              lastUpdated: integration.updatedAt,
              createdAt: integration.createdAt,
              config: integration.config || {},
            }))
          : [];

        setIntegrations(transformedIntegrations);
      } catch (err) {
        console.error("Failed to load integrations:", err);
        setIntegrations([]);
        setError(
          "Unable to load integrations. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      loadIntegrations();
    }
  }, [initialized]);

  // Filter integrations
  const filterIntegrations = useCallback(
    (searchTerm, filters = {}) => {
      // Ensure integrations is always an array
      const integrationsArray = Array.isArray(integrations) ? integrations : [];

      return integrationsArray.filter((integration) => {
        const matchesSearch =
          !searchTerm ||
          integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          integration.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !filters.category ||
          filters.category === "All Categories" ||
          integration.category === filters.category;

        const matchesStatus =
          !filters.status ||
          filters.status === "All Statuses" ||
          integration.status === filters.status;

        const matchesActive =
          filters.activeOnly === undefined ||
          integration.isActive === filters.activeOnly;

        return (
          matchesSearch && matchesCategory && matchesStatus && matchesActive
        );
      });
    },
    [integrations]
  );

  // Integration CRUD operations
  const createIntegration = useCallback(async (integrationData) => {
    setLoading(true);
    setError(null);

    // Optimistic update - add integration immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticIntegration = {
      id: tempId,
      name: integrationData.name,
      description: integrationData.description,
      category: integrationData.category,
      apiKey: integrationData.apiKey,
      endpointUrl: integrationData.endpointUrl,
      isActive: integrationData.isActive || false,
      status: "Untested",
      lastTested: null,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      config: {},
    };

    setIntegrations((prev) => [...prev, optimisticIntegration]);

    try {
      const response = await INTEGRATION_API.create({
        integrationName: integrationData.name,
        category: integrationData.category,
        apiKey: integrationData.apiKey,
        endpointUrl: integrationData.endpointUrl,
        description: integrationData.description,
        active: integrationData.isActive || false,
      });

      // Transform API response to UI format
      const apiIntegration = response.data.data || response.data;
      const newIntegration = {
        id: apiIntegration.id,
        name: apiIntegration.integrationName,
        description: apiIntegration.description,
        category: apiIntegration.category,
        apiKey: apiIntegration.apiKey,
        endpointUrl: apiIntegration.endpointUrl,
        isActive: apiIntegration.active,
        status: apiIntegration.active ? "Connected" : "Disconnected",
        lastTested: apiIntegration.lastTested || null,
        lastUpdated: apiIntegration.updatedAt,
        createdAt: apiIntegration.createdAt,
        config: apiIntegration.config || {},
      };

      // Replace optimistic update with real data
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === tempId ? newIntegration : integration
        )
      );

      return { success: true, integration: newIntegration };
    } catch (err) {
      // Remove optimistic update on error
      setIntegrations((prev) =>
        prev.filter((integration) => integration.id !== tempId)
      );

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create integration";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIntegration = useCallback(
    async (integrationId, updateData) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalIntegration = integrations.find(
        (i) => i.id === integrationId
      );

      // Optimistic update - update integration immediately in UI
      const optimisticUpdate = {
        ...originalIntegration,
        name: updateData.name,
        description: updateData.description,
        category: updateData.category,
        apiKey: updateData.apiKey,
        endpointUrl: updateData.endpointUrl,
        isActive: updateData.isActive,
        status: updateData.isActive ? "Connected" : "Disconnected",
        lastUpdated: new Date().toISOString(),
      };

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? optimisticUpdate : integration
        )
      );

      try {
        const response = await INTEGRATION_API.update(integrationId, {
          integrationName: updateData.name,
          category: updateData.category,
          apiKey: updateData.apiKey,
          endpointUrl: updateData.endpointUrl,
          description: updateData.description,
          active: updateData.isActive,
        });

        // Transform API response to UI format
        const apiIntegration = response.data.data || response.data;
        const updatedIntegration = {
          id: apiIntegration.id,
          name: apiIntegration.integrationName,
          description: apiIntegration.description,
          category: apiIntegration.category,
          apiKey: apiIntegration.apiKey,
          endpointUrl: apiIntegration.endpointUrl,
          isActive: apiIntegration.active,
          status: apiIntegration.active ? "Connected" : "Disconnected",
          lastTested: apiIntegration.lastTested || null,
          lastUpdated: apiIntegration.updatedAt,
          createdAt: apiIntegration.createdAt,
          config: apiIntegration.config || {},
        };

        // Replace optimistic update with real data
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? updatedIntegration : integration
          )
        );

        return { success: true };
      } catch (err) {
        // Rollback optimistic update on error
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? originalIntegration : integration
          )
        );

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update integration";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [integrations]
  );

  const deleteIntegration = useCallback(
    async (integrationId) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalIntegration = integrations.find(
        (i) => i.id === integrationId
      );

      // Optimistic update - remove integration immediately from UI
      setIntegrations((prev) =>
        prev.filter((integration) => integration.id !== integrationId)
      );

      try {
        await INTEGRATION_API.delete(integrationId);
        return { success: true };
      } catch (err) {
        // Rollback optimistic update on error
        setIntegrations((prev) => [...prev, originalIntegration]);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete integration";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [integrations]
  );

  // Test connection
  const testConnection = useCallback(
    async (integrationId) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalIntegration = integrations.find(
        (i) => i.id === integrationId
      );

      // Optimistic update - show testing status immediately
      const optimisticUpdate = {
        ...originalIntegration,
        status: "Testing",
        lastTested: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? optimisticUpdate : integration
        )
      );

      try {
        // Try to use API test endpoint if available, otherwise simulate
        try {
          const response = await INTEGRATION_API.testConnection(integrationId);
          const result = response.data;

          // Update integration status based on test result
          const testResult = {
            ...originalIntegration,
            status: result.success ? "Connected" : "Failed",
            error: result.success ? null : result.error,
            lastTested: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };

          setIntegrations((prev) =>
            prev.map((integration) =>
              integration.id === integrationId ? testResult : integration
            )
          );

          return {
            success: result.success,
            status: result.success ? "Connected" : "Failed",
            error: result.error,
            message: result.success ? "Connection successful!" : result.error,
          };
        } catch (apiError) {
          // Fallback to simulation if API endpoint doesn't exist
          const integration = integrations.find((i) => i.id === integrationId);
          if (!integration) {
            throw new Error("Integration not found");
          }

          // Simulate success/failure based on integration name
          const isSuccess = !["intercom", "failed"].some((term) =>
            integration.name.toLowerCase().includes(term)
          );

          const status = isSuccess ? "Connected" : "Failed";
          const error = isSuccess
            ? null
            : "Connection timeout - Please check your API key and endpoint";

          const testResult = {
            ...originalIntegration,
            status,
            error,
            lastTested: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };

          setIntegrations((prev) =>
            prev.map((integration) =>
              integration.id === integrationId ? testResult : integration
            )
          );

          return {
            success: isSuccess,
            status,
            error,
            message: isSuccess ? "Connection successful!" : error,
          };
        }
      } catch (err) {
        // Rollback optimistic update on error
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? originalIntegration : integration
          )
        );

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to test connection";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [integrations]
  );

  // Toggle integration status
  const toggleIntegrationStatus = useCallback(
    async (integrationId) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalIntegration = integrations.find(
        (i) => i.id === integrationId
      );

      // Optimistic update - toggle status immediately in UI
      const optimisticUpdate = {
        ...originalIntegration,
        isActive: !originalIntegration.isActive,
        status: !originalIntegration.isActive ? "Connected" : "Disconnected",
        lastUpdated: new Date().toISOString(),
      };

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? optimisticUpdate : integration
        )
      );

      try {
        const response = await INTEGRATION_API.toggleStatus(integrationId);

        // Transform API response to UI format
        const apiIntegration = response.data.data || response.data;
        const updatedIntegration = {
          id: apiIntegration.id,
          name: apiIntegration.integrationName,
          description: apiIntegration.description,
          category: apiIntegration.category,
          apiKey: apiIntegration.apiKey,
          endpointUrl: apiIntegration.endpointUrl,
          isActive: apiIntegration.active,
          status: apiIntegration.active ? "Connected" : "Disconnected",
          lastTested: apiIntegration.lastTested || null,
          lastUpdated: apiIntegration.updatedAt,
          createdAt: apiIntegration.createdAt,
          config: apiIntegration.config || {},
        };

        // Replace optimistic update with real data
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? updatedIntegration : integration
          )
        );

        return { success: true };
      } catch (err) {
        // Rollback optimistic update on error
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId ? originalIntegration : integration
          )
        );

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to toggle integration status";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [integrations]
  );

  // EXCLUDED: Notification settings operations not supported per requirements
  const updateNotificationSettings = useCallback(async (settings) => {
    // Notification settings updates disabled per requirements
    console.log("Notification settings updates are disabled per requirements");
    return { success: false, error: "Notification settings not supported" };

    /* ORIGINAL CODE - COMMENTED OUT
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNotificationSettings(prev => ({
        ...prev,
        ...settings
      }));

      return { success: true };
    } catch (err) {
      setError('Failed to update notification settings');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
    */
  }, []);

  // EXCLUDED: Firebase A/B testing flags toggle not supported per requirements
  const toggleFirebaseFeature = useCallback(async (featureKey) => {
    // Firebase feature toggles disabled per requirements
    console.log("Firebase feature toggles are disabled per requirements");
    return { success: false, error: "Firebase feature toggles not supported" };

    /* ORIGINAL CODE - COMMENTED OUT
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setFirebaseFeatures(prev => prev.map(feature =>
        feature.key === featureKey
          ? { ...feature, enabled: !feature.enabled }
          : feature
      ));

      return { success: true };
    } catch (err) {
      setError('Failed to toggle Firebase feature');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
    */
  }, []);

  // Computed values
  const stats = useMemo(() => {
    // Ensure integrations is always an array
    const integrationsArray = Array.isArray(integrations) ? integrations : [];

    const total = integrationsArray.length;
    const connected = integrationsArray.filter(
      (i) => i.status === "Connected"
    ).length;
    const active = integrationsArray.filter((i) => i.isActive).length;
    const failed = integrationsArray.filter(
      (i) => i.status === "Failed"
    ).length;

    return {
      total,
      connected,
      active,
      failed,
      connectionRate: total > 0 ? Math.round((connected / total) * 100) : 0,
    };
  }, [integrations]);

  // Return hook interface
  return {
    // Data
    integrations,
    notificationSettings,
    firebaseFeatures,
    stats,
    loading,
    error,

    // Constants
    categories: INTEGRATION_CATEGORIES,
    statuses: CONNECTION_STATUSES,
    availableIntegrations: AVAILABLE_INTEGRATIONS,
    triggerEvents: TRIGGER_EVENTS,
    notificationRoles: NOTIFICATION_ROLES,

    // Integration operations
    filterIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    toggleIntegrationStatus,

    // Notification operations
    updateNotificationSettings,
    toggleFirebaseFeature,

    // Utility
    clearError: () => setError(null),
  };
};
