"use client";

import { useState, useMemo } from "react";
import IntegrationTable from "./components/IntegrationTable";
import {
  AddIntegrationModal,
  EditIntegrationModal,
  TestConnectionModal,
  ConfirmationModal,
} from "./modals";

export default function SDKIntegrationPanel({
  integrations,
  stats,
  categories,
  statuses,
  availableIntegrations,
  loading,
  filterIntegrations,
  onCreateIntegration,
  onUpdateIntegration,
  onDeleteIntegration,
  onTestConnection,
  onToggleStatus,
  onShowNotification,
}) {
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "All Statuses",
  });

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [integrationToDelete, setIntegrationToDelete] = useState(null);

  // Filtered integrations
  const filteredIntegrations = useMemo(() => {
    return filterIntegrations(filters.searchTerm, filters);
  }, [filterIntegrations, filters]);

  // Handlers
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleAddIntegration = () => {
    setShowAddModal(true);
  };

  const handleEditIntegration = (integration) => {
    setSelectedIntegration(integration);
    setShowEditModal(true);
  };

  const handleTestConnection = async (integration) => {
    setSelectedIntegration(integration);

    try {
      const result = await onTestConnection(integration.id);
      setTestResult(result);
      setShowTestModal(true);

      if (result.success) {
        onShowNotification(`✅ ${integration.name} connection successful!`);
      } else {
        onShowNotification(
          `❌ ${integration.name} connection failed: ${result.error}`,
          "error"
        );
      }
    } catch (error) {
      onShowNotification(
        `Failed to test ${integration.name} connection`,
        "error"
      );
    }
  };

  const handleDeleteIntegration = (integration) => {
    setIntegrationToDelete(integration);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (integration) => {
    try {
      await onToggleStatus(integration.id);
      const newStatus = integration.isActive ? "disabled" : "enabled";
      onShowNotification(`${integration.name} ${newStatus} successfully`);
    } catch (error) {
      onShowNotification(
        `Failed to toggle ${integration.name} status`,
        "error"
      );
    }
  };

  const handleCreateIntegration = async (integrationData) => {
    try {
      const result = await onCreateIntegration(integrationData);
      if (result.success) {
        setShowAddModal(false);
        onShowNotification(
          `${integrationData.name} integration created successfully!`
        );
      }
    } catch (error) {
      onShowNotification("Failed to create integration", "error");
    }
  };

  const handleUpdateIntegration = async (integrationData) => {
    try {
      const result = await onUpdateIntegration(
        selectedIntegration.id,
        integrationData
      );
      if (result.success) {
        setShowEditModal(false);
        setSelectedIntegration(null);
        onShowNotification(
          `${integrationData.name} integration updated successfully!`
        );
      }
    } catch (error) {
      onShowNotification("Failed to update integration", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      const result = await onDeleteIntegration(integrationToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setIntegrationToDelete(null);
        onShowNotification(
          `${integrationToDelete.name} integration deleted successfully!`
        );
      }
    } catch (error) {
      onShowNotification("Failed to delete integration", "error");
    }
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowTestModal(false);
    setShowDeleteModal(false);
    setSelectedIntegration(null);
    setTestResult(null);
    setIntegrationToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && integrations.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="animate-spin w-8 h-8 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Integrations
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch your integrations...
          </p>
        </div>
      )}

      {/* Header with Search and Filters */}
      {!loading && integrations.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search integrations..."
                value={filters.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Status Filter - Basic as per requirements */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Add Integration Button */}
            <button
              onClick={handleAddIntegration}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Integration</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {integrations.length > 0 && (
        <div className="text-sm text-gray-600">
          {filteredIntegrations.length === integrations.length ? (
            <span>
              Showing all {integrations.length} integration
              {integrations.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span>
              Showing {filteredIntegrations.length} of {integrations.length}{" "}
              integration{integrations.length !== 1 ? "s" : ""}
              {filters.searchTerm && (
                <span> matching &quot;{filters.searchTerm}&quot;</span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Integration Table */}
      {filteredIntegrations.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>

          {integrations.length === 0 ? (
            // No integrations at all
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Integrations
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect your favorite tools and services to streamline your
                workflow. Add your first integration to get started.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleAddIntegration}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Your First Integration
                </button>
                <p className="text-sm text-gray-500">
                  Popular integrations: Bitlabs, Tremendous, Intercom, Everflow
                </p>
              </div>
            </div>
          ) : (
            // Has integrations but filtered results are empty
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No matching integrations
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.searchTerm
                  ? `No integrations match "${filters.searchTerm}"`
                  : `No integrations match the selected filters`}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setFilters({ searchTerm: "", status: "All Statuses" });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleAddIntegration}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors ml-3"
                >
                  Add New Integration
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <IntegrationTable
          integrations={filteredIntegrations}
          onEdit={handleEditIntegration}
          onTest={handleTestConnection}
          onDelete={handleDeleteIntegration}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Modals */}
      <AddIntegrationModal
        isOpen={showAddModal}
        onClose={closeAllModals}
        onSave={handleCreateIntegration}
        availableIntegrations={availableIntegrations}
        categories={categories}
      />

      <EditIntegrationModal
        isOpen={showEditModal}
        onClose={closeAllModals}
        onSave={handleUpdateIntegration}
        integration={selectedIntegration}
        categories={categories}
      />

      <TestConnectionModal
        isOpen={showTestModal}
        onClose={closeAllModals}
        integration={selectedIntegration}
        testResult={testResult}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeAllModals}
        onConfirm={handleConfirmDelete}
        title="Delete Integration"
        message={`Are you sure you want to delete ${integrationToDelete?.name}? This action cannot be undone and may affect your application's functionality.`}
        confirmText="Delete"
        confirmStyle="danger"
      />
    </div>
  );
}
