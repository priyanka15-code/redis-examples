
/* on this api sending multiple reuqst in multiple businessId and in one businessId send 5 request in this reques in first two request is not send userId other 2 request is send UserId and after 1 request send dublicate user id */

const axios = require('axios');

// In-memory set to track used user IDs
const usedUserIds = new Set();

const sendBatchRequests = async (businessIds, numRequestsPerBusiness, endpoint, createPayload) => {
  const requests = [];
  
  for (const businessId of businessIds) {
    for (let i = 0; i < numRequestsPerBusiness; i++) {
      const timestamp = Date.now();
      let payload = createPayload(i, businessId);

      // Ensure unique user ID is used for each request
      if (endpoint.includes('register')) {
        payload = ensureUniqueUserId(payload);  // Update payload with unique userId
      }
      
      // Debugging: Print payload to verify its format
      console.log('Sending payload:', payload);
      
      const request = axios.post(endpoint, payload);
      requests.push(request);
    }
  }

  try {
    const responses = await Promise.all(requests);
    console.log('All requests completed:', responses.map(res => res.data));
  } catch (error) {
    console.error('Error in requests:', error.response ? error.response.data : error.message);
  }
};

const createUserPayload = (index, businessId) => ({
  username: `user${index}`,
  password: 'password123',
  email: `user${index}@example.com`,
  business: businessId, 
  userId: `user-${index}` 
});

// const createBusinessPayload = (index, timestamp) => ({
//   businessname: `business${index}_${timestamp}`
// });

const fetchBusinessIds = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/business/get');
    return response.data.map(business => business._id);
  } catch (error) {
    console.error('Error fetching business IDs:', error.response ? error.response.data : error.message);
    return [];
  }
};

const ensureUniqueUserId = (payload) => {
  let { userId } = payload;
  while (usedUserIds.has(userId)) {
    // If userId exists, generate a new one
    userId = `${userId}-${Date.now()}`;
  }
  // Add the userId to the set
  usedUserIds.add(userId);
  return { ...payload, userId };  
};

(async () => {
  const businessIds = await fetchBusinessIds();

  if (businessIds.length >= 2) {
    await sendBatchRequests([businessIds[0], businessIds[1], businessIds[0]], 2, 'http://localhost:3000/api/back/register', createUserPayload);
  } else {
    console.error('Not enough business IDs to perform the test.');
  }
})();

/* Done Task:

- Work with Kuldip on the redis generating unique back numbes and it's sequences. all work is done
- now what is my next Task
Good evening! */