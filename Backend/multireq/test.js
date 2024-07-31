const axios = require('axios');

const sendRequests = async () => {
  const numRequests = 100; 
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
