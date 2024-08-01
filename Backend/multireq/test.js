/* /* const axios = require('axios');

const sendRequests = async () => {
  const numRequests = 10; 
  const requests = [];
  
  for (let i = 0; i < numRequests; i++) {
    const timestamp = Date.now(); 
    const request = axios.post('http://localhost:3000/api/auth/register', {
      username: `user${i}_${timestamp}`,
      password: 'password123',
      email: `user${i}_${timestamp}@example.com`
    });
    requests.push(request);
  }

  try {
    const responses = await Promise.all(requests);
    console.log('All requests completed:', responses.map(res => res.data));
  } catch (error) {
    console.error('Error in requests:', error.response ? error.response.data : error.message);
  }
};

sendRequests();
 */

/* const axios = require('axios');

const sendRequests = async (numRequests, endpoint, createPayload) => {
  const requests = [];

  for (let i = 0; i < numRequests; i++) {
    const timestamp = Date.now();
    const payload = createPayload(i, timestamp);
    const request = axios.post(endpoint, payload);
    requests.push(request);
  }

  try {
    const responses = await Promise.all(requests);
    console.log('All requests completed:', responses.map(res => res.data));
  } catch (error) {
    console.error('Error in requests:', error.response ? error.response.data : error.message);
  }
};

const createUserPayload = (index, timestamp) => ({
  username: `user${index}_${timestamp}`,
  password: 'password123',
  email: `user${index}_${timestamp}@example.com`
});

const createBusinessPayload = (index, timestamp) => ({
  businessname: `business${index}_${timestamp}`
});

sendRequests(10, 'http://localhost:3000/api/auth/register', createUserPayload);
sendRequests(10, 'http://localhost:3000/api/business/register', createBusinessPayload);
 */ 

const axios = require('axios');

const sendBatchRequests = async (businessIds, numRequestsPerBusiness, endpoint, createPayload) => {
  const requests = [];

  for (const businessId of businessIds) {
    for (let i = 0; i < numRequestsPerBusiness; i++) {
      const timestamp = Date.now();
      const payload = createPayload(i, timestamp, businessId);
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

const createUserPayload = (index, timestamp, businessId) => ({
  username: `user${index}_${timestamp}`,
  password: 'password123',
  email: `user${index}_${timestamp}@example.com`,
  business: businessId 
});

const createBusinessPayload = (index, timestamp) => ({
  businessname: `business${index}_${timestamp}`
});

const fetchBusinessIds = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/business/get');
    return response.data.map(business => business._id);
  } catch (error) {
    console.error('Error fetching business IDs:', error.response ? error.response.data : error.message);
    return [];
  }
};

(async () => {
  const businessIds = await fetchBusinessIds();

  if (businessIds.length >= 2) {
    await sendBatchRequests([businessIds[0], businessIds[1]], 5, 'http://localhost:3000/api/auth/register', createUserPayload);
    await sendBatchRequests([businessIds[0], businessIds[1]], 5, 'http://localhost:3000/api/business/register', createBusinessPayload);
    await sendBatchRequests([businessIds[0], businessIds[1]], 5, 'http://localhost:3000/api/merge/register', createBusinessPayload);
  
  } else {
    console.error('Not enough business IDs to perform the test.');
  }
})();
