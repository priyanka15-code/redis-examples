const axios = require('axios');

// Configure your server URL
const serverUrl = 'http://localhost:3000/api/merge/register';
const businessApiUrl = 'http://localhost:3000/api/business/get';

// Function to fetch business IDs
const fetchBusinessIds = async () => {
  try {
    const response = await axios.get(businessApiUrl);
    return response.data.map(business => business._id);
  } catch (error) {
    console.error('Error fetching business IDs:', error.response ? error.response.data : error.message);
    return [];
  }
};

// Function to send multiple requests sequentially
const sendRequestsSequentially = async (businessId, index, numberOfRequests) => {
  for (let i = 0; i < numberOfRequests; i++) {
    const uniqueIndex = `${index}-${i}`; // Unique index for each request
    const timestamp = new Date().toISOString(); // Timestamp for uniqueness
    
    const requestPayload = {
      username: `user${uniqueIndex}_${timestamp}`,
      password: 'password123',
      email: `user${uniqueIndex}_${timestamp}@example.com`,
      business: businessId,
    };

    try {
      const response = await axios.post(serverUrl, requestPayload);
      console.log(`Response for request ${i} with businessId ${businessId}:`, response.data);
    } catch (error) {
      console.error(`Error for request ${i} with businessId ${businessId}:`, error.response ? error.response.data : error.message);
    }
  }
};

// Fetch business IDs and send requests sequentially
(async () => {
  const businessIds = await fetchBusinessIds();

  if (businessIds.length > 0) {
    console.log('Sending requests for the first business ID...');
    await sendRequestsSequentially(businessIds[0], 1, 10);

    if (businessIds.length > 1) {
      console.log('Sending requests for the second business ID...');
      await sendRequestsSequentially(businessIds[1], 2, 10);
    } else {
      console.error('Only one business ID found.');
    }
  } else {
    console.error('No business IDs found.');
  }

  console.log('All requests sent.');
})();
