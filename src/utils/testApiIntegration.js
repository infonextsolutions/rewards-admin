// Simple test utility to verify API integration
import { INTEGRATION_API } from "../data/integrations";

export const testApiIntegration = async () => {
  console.log("🧪 Testing API Integration...");

  try {
    // Test 1: Get all integrations
    console.log("📡 Testing GET /integration...");
    const getAllResponse = await INTEGRATION_API.getAll({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    console.log("✅ GET all integrations successful:", getAllResponse.data);

    // Test 2: Create a test integration
    console.log("📡 Testing POST /integration...");
    const testIntegration = {
      integrationName: "Test Integration",
      category: "Analytics",
      apiKey: "test_api_key_123",
      endpointUrl: "https://api.test.com/v1",
      description: "Test integration for API verification",
      active: true,
    };

    const createResponse = await INTEGRATION_API.create(testIntegration);
    console.log("✅ POST create integration successful:", createResponse.data);

    const createdId = createResponse.data.id || createResponse.data._id;

    if (createdId) {
      // Test 3: Get integration by ID
      console.log("📡 Testing GET /integration/:id...");
      const getByIdResponse = await INTEGRATION_API.getById(createdId);
      console.log("✅ GET integration by ID successful:", getByIdResponse.data);

      // Test 4: Update integration
      console.log("📡 Testing PUT /integration/:id...");
      const updateData = {
        integrationName: "Updated Test Integration",
        category: "Analytics",
        apiKey: "updated_test_api_key_123",
        endpointUrl: "https://api.test.com/v2",
        description: "Updated test integration for API verification",
        active: false,
      };

      const updateResponse = await INTEGRATION_API.update(
        createdId,
        updateData
      );
      console.log("✅ PUT update integration successful:", updateResponse.data);

      // Test 5: Toggle integration status
      console.log("📡 Testing PATCH /integration/:id/toggle...");
      const toggleResponse = await INTEGRATION_API.toggleStatus(createdId);
      console.log("✅ PATCH toggle status successful:", toggleResponse.data);

      // Test 6: Delete integration
      console.log("📡 Testing DELETE /integration/:id...");
      const deleteResponse = await INTEGRATION_API.delete(createdId);
      console.log("✅ DELETE integration successful:", deleteResponse.data);
    }

    console.log("🎉 All API integration tests passed!");
    return { success: true, message: "All API integration tests passed!" };
  } catch (error) {
    console.error("❌ API integration test failed:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    return {
      success: false,
      error: error.message,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
    };
  }
};

// Export for use in development
export default testApiIntegration;
