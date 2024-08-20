
const redis = require('redis');

const moment = require('moment');
const initRedisClient = async () => {
  console.log("Initializing Redis client");
  const client = redis.createClient({
    socket: {
      port: 6379,
      host: '127.0.0.1',
    }
  });
  
  await client.connect();
  console.log("Client connected");

  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  client.on('end', () => {
    console.log('Redis client disconnected');
  });

  return client;
};

const generateId = async (keyPrefix, businessId = '') => {
  const redisClient = await initRedisClient();
  console.log("generateId");
  

  try {
    const counterKey = businessId ? `${businessId}:${keyPrefix}IdCounter` : `${keyPrefix}IdCounter`;
    const counter = await redisClient.incr(counterKey);

    if (counter === null) {
      throw new Error('Failed to increment counter');
    }

    const paddedCounter = String(counter).padStart(5, '0');
    const date = moment().format('YYYYMMDD');
    const time = moment().format('HHmmssSSS');
    const id = `${keyPrefix}-T${paddedCounter}-${date}-${time}`;

    return id;
  } finally {
    await redisClient.quit();
  }
};
const generateUId = async (businessId, suffix = '') => {
  const redisClient = await initRedisClient();
  console.log("hello");

  try {
    const counterKey = businessId ? `${businessId}:UIdCounter` : 'UIdCounter';
    const counter = await redisClient.incr(counterKey);  
    if (counter === null) {
      throw new Error('Failed to increment counter');
    }

    const paddedCounter = String(counter).padStart(5, '0');
    let userId = `${paddedCounter}${suffix}`;
    
    return userId;
  } finally {
    await redisClient.quit();
  }
};



const generateUserId = async (businessId) => generateId('U', businessId);
const generateBusinessId = async () => generateId('B');
const generateUBId = async () => generateId('UB');



// Cache user in Redis
const cacheUser = async (user) => {
  const redisClient = await initRedisClient();
  await redisClient.set(user.username, JSON.stringify(user));
  await redisClient.quit();
};

// Check user in Redis cache
const checkUserInCache = async (username) => {
  const redisClient = await initRedisClient();
  const user = await redisClient.get(username);
  await redisClient.quit();
  return user ? JSON.parse(user) : null;
};


module.exports = { initRedisClient, generateUserId, generateBusinessId,generateUId, generateUBId, cacheUser, checkUserInCache };


/* const generateUserId = async () => {
  const redisClient = await initRedisClient();

  try {
    // Atomic increment operation
    const counter = await redisClient.incr('userIdCounter');

    if (counter === null) {
      throw new Error('Failed to increment counter');
    }

    // Format the counter and create the user ID
    const paddedCounter = String(counter).padStart(5, '0');
    const date = moment().format('YYYYMMDD');
    const time = moment().format('HHmmss');
    const userId = `T${paddedCounter}-${date}-${time}`;

    return userId;
  } finally {
    await redisClient.quit();
  }
};


 */