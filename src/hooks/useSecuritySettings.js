import { useState, useEffect, useCallback, useMemo } from "react";
import { SECURITY_API } from "../data/security";

export const useSecuritySettings = () => {
  const [securitySettings, setSecuritySettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Load security settings from API
  useEffect(() => {
    const loadSecuritySettings = async () => {
      setLoading(true);
      try {
        const response = await SECURITY_API.getAll({
          page: 1,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        // Handle the nested response structure: data.data.securitySettings
        const settingsData =
          response.data?.data?.securitySettings ||
          response.data?.securitySettings ||
          response.data?.data ||
          response.data ||
          [];

        // Transform API data to match UI expectations
        const transformedSettings = Array.isArray(settingsData)
          ? settingsData.map((setting) => ({
              id: setting.id,
              name: setting.name,
              verificationMethod: setting.verificationMethod,
              retryType: setting.retryType,
              retryLimit: setting.retryLimit,
              lockDuration: setting.lockDuration,
              userRole: setting.userRole,
              status: setting.status,
              createdAt: setting.createdAt,
              updatedAt: setting.updatedAt,
            }))
          : [];

        setSecuritySettings(transformedSettings);
      } catch (err) {
        console.error("Failed to load security settings:", err);
        setSecuritySettings([]);
        setError(
          "Unable to load security settings. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      loadSecuritySettings();
    }
  }, [initialized]);

  // Filter security settings
  const filterSecuritySettings = useCallback(
    (searchTerm, filters = {}) => {
      // Ensure securitySettings is always an array
      const settingsArray = Array.isArray(securitySettings)
        ? securitySettings
        : [];

      return settingsArray.filter((setting) => {
        const matchesSearch =
          !searchTerm ||
          setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          setting.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
          setting.verificationMethod
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesUserRole =
          !filters.userRole ||
          filters.userRole === "All Roles" ||
          setting.userRole === filters.userRole;

        const matchesStatus =
          !filters.status ||
          filters.status === "All Statuses" ||
          setting.status === filters.status;

        const matchesVerificationMethod =
          !filters.verificationMethod ||
          filters.verificationMethod === "All Methods" ||
          setting.verificationMethod === filters.verificationMethod;

        return (
          matchesSearch &&
          matchesUserRole &&
          matchesStatus &&
          matchesVerificationMethod
        );
      });
    },
    [securitySettings]
  );

  // Create security settings
  const createSecuritySettings = useCallback(async (settingsData) => {
    setLoading(true);
    setError(null);

    // Optimistic update - add settings immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticSettings = {
      id: tempId,
      name: settingsData.name,
      verificationMethod: settingsData.verificationMethod,
      retryType: settingsData.retryType,
      retryLimit: settingsData.retryLimit,
      lockDuration: settingsData.lockDuration,
      userRole: settingsData.userRole,
      status: settingsData.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSecuritySettings((prev) => [...prev, optimisticSettings]);

    try {
      const response = await SECURITY_API.create({
        name: settingsData.name,
        verificationMethod: settingsData.verificationMethod,
        retryType: settingsData.retryType,
        retryLimit: settingsData.retryLimit,
        lockDuration: settingsData.lockDuration,
        userRole: settingsData.userRole,
        status: settingsData.status || "active",
      });

      // Transform API response to UI format
      const apiSettings = response.data.data || response.data;
      const newSettings = {
        id: apiSettings.id,
        name: apiSettings.name,
        verificationMethod: apiSettings.verificationMethod,
        retryType: apiSettings.retryType,
        retryLimit: apiSettings.retryLimit,
        lockDuration: apiSettings.lockDuration,
        userRole: apiSettings.userRole,
        status: apiSettings.status,
        createdAt: apiSettings.createdAt,
        updatedAt: apiSettings.updatedAt,
      };

      // Replace optimistic update with real data
      setSecuritySettings((prev) =>
        prev.map((setting) => (setting.id === tempId ? newSettings : setting))
      );

      return { success: true, settings: newSettings };
    } catch (err) {
      // Remove optimistic update on error
      setSecuritySettings((prev) =>
        prev.filter((setting) => setting.id !== tempId)
      );

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create security settings";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update security settings
  const updateSecuritySettings = useCallback(
    async (settingsId, updateData) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalSettings = securitySettings.find(
        (s) => s.id === settingsId
      );

      // Optimistic update - update settings immediately in UI
      const optimisticUpdate = {
        ...originalSettings,
        name: updateData.name,
        verificationMethod: updateData.verificationMethod,
        retryType: updateData.retryType,
        retryLimit: updateData.retryLimit,
        lockDuration: updateData.lockDuration,
        userRole: updateData.userRole,
        status: updateData.status,
        updatedAt: new Date().toISOString(),
      };

      setSecuritySettings((prev) =>
        prev.map((setting) =>
          setting.id === settingsId ? optimisticUpdate : setting
        )
      );

      try {
        const response = await SECURITY_API.update(settingsId, {
          name: updateData.name,
          verificationMethod: updateData.verificationMethod,
          retryType: updateData.retryType,
          retryLimit: updateData.retryLimit,
          lockDuration: updateData.lockDuration,
          userRole: updateData.userRole,
          status: updateData.status,
        });

        // Transform API response to UI format
        const apiSettings = response.data.data || response.data;
        const updatedSettings = {
          id: apiSettings.id,
          name: apiSettings.name,
          verificationMethod: apiSettings.verificationMethod,
          retryType: apiSettings.retryType,
          retryLimit: apiSettings.retryLimit,
          lockDuration: apiSettings.lockDuration,
          userRole: apiSettings.userRole,
          status: apiSettings.status,
          createdAt: apiSettings.createdAt,
          updatedAt: apiSettings.updatedAt,
        };

        // Replace optimistic update with real data
        setSecuritySettings((prev) =>
          prev.map((setting) =>
            setting.id === settingsId ? updatedSettings : setting
          )
        );

        return { success: true };
      } catch (err) {
        // Rollback optimistic update on error
        setSecuritySettings((prev) =>
          prev.map((setting) =>
            setting.id === settingsId ? originalSettings : setting
          )
        );

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update security settings";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [securitySettings]
  );

  // Delete security settings
  const deleteSecuritySettings = useCallback(
    async (settingsId) => {
      setLoading(true);
      setError(null);

      // Store original data for rollback
      const originalSettings = securitySettings.find(
        (s) => s.id === settingsId
      );

      // Optimistic update - remove settings immediately from UI
      setSecuritySettings((prev) =>
        prev.filter((setting) => setting.id !== settingsId)
      );

      try {
        await SECURITY_API.delete(settingsId);
        return { success: true };
      } catch (err) {
        // Restore original data on error
        setSecuritySettings((prev) => [...prev, originalSettings]);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete security settings";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [securitySettings]
  );

  // Test SDK connection
  const testSDKConnection = useCallback(async (connectionData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await SECURITY_API.testConnection(connectionData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to test SDK connection";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const settingsArray = Array.isArray(securitySettings)
      ? securitySettings
      : [];
    return {
      total: settingsArray.length,
      active: settingsArray.filter((s) => s.status === "active").length,
      inactive: settingsArray.filter((s) => s.status === "inactive").length,
      byUserRole: settingsArray.reduce((acc, setting) => {
        acc[setting.userRole] = (acc[setting.userRole] || 0) + 1;
        return acc;
      }, {}),
      byVerificationMethod: settingsArray.reduce((acc, setting) => {
        acc[setting.verificationMethod] =
          (acc[setting.verificationMethod] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [securitySettings]);

  return {
    securitySettings,
    loading,
    error,
    initialized,
    filterSecuritySettings,
    createSecuritySettings,
    updateSecuritySettings,
    deleteSecuritySettings,
    testSDKConnection,
    stats,
    setError,
  };
};
