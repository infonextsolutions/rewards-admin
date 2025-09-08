// Mock data operations for Survey & Non-Gaming Offers module
// This file provides mock functionality without API calls

const surveyAPIs = {
  // Mock success response
  mockSuccess: () => Promise.resolve({ success: true }),
  
  // Mock delay for realistic behavior
  mockDelay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))
};

export default surveyAPIs;