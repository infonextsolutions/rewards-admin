"use client";

import { useState } from "react";
import testApiIntegration from "../../utils/testApiIntegration";

export default function ApiTestPanel() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestApi = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testApiIntegration();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          API Integration Test
        </h3>
        <button
          onClick={handleTestApi}
          disabled={testing}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            testing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {testing ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-4 w-4"
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
              <span>Testing...</span>
            </div>
          ) : (
            "Test API Integration"
          )}
        </button>
      </div>

      {testResult && (
        <div
          className={`rounded-lg p-4 ${
            testResult.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {testResult.success ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h4
                className={`text-sm font-medium ${
                  testResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {testResult.success
                  ? "API Integration Test Passed!"
                  : "API Integration Test Failed"}
              </h4>
              <div className="mt-2 text-sm">
                {testResult.success ? (
                  <p className="text-green-700">{testResult.message}</p>
                ) : (
                  <div className="text-red-700">
                    <p className="font-medium">Error: {testResult.error}</p>
                    {testResult.details && (
                      <div className="mt-2">
                        <p>Status: {testResult.details.status}</p>
                        <p>Status Text: {testResult.details.statusText}</p>
                        {testResult.details.data && (
                          <p>
                            Response:{" "}
                            {JSON.stringify(testResult.details.data, null, 2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          This test will verify all CRUD operations with the integration API:
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>GET /integration (list all integrations)</li>
          <li>POST /integration (create integration)</li>
          <li>GET /integration/:id (get integration by ID)</li>
          <li>PUT /integration/:id (update integration)</li>
          <li>PATCH /integration/:id/toggle (toggle status)</li>
          <li>DELETE /integration/:id (delete integration)</li>
        </ul>
      </div>
    </div>
  );
}
