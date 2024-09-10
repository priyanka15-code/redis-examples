
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

const storeFailedRegistration = async (user) => {
  const redisClient = await initRedisClient();
  const key = `failed:${user.username}:${user.email}`;
  
  try {
    await redisClient.hSet(key, {
      userId: user.userId,
      username: user.username,
      email: user.email,
      error: user.error,
    });
    await redisClient.expire(key, 3600); 
  } catch (err) {
    console.error('Error storing failed registration:', err);
    throw err;
  }
};
const getFailedRegistration = async (username, email) => {
  const redisClient = await initRedisClient();
  const key = `failed:${username}:${email}`;
  
  try {
    const data = await redisClient.hGetAll(key);
    return data;
  } catch (err) {
    console.error('Error getting failed registration:', err);
    throw err;
  }
};



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

const RATE_LIMIT_WINDOW = 15 * 60; 
const MAX_ATTEMPTS = 5;  

const loginRateLimiter = async (username) => {
  const redisClient = await initRedisClient();
  const key = `login_attempts:${username}`;

  try {
    const attempts = await redisClient.incr(key);

    if (attempts === 1) {
      await redisClient.expire(key, RATE_LIMIT_WINDOW);
    }

    if (attempts > MAX_ATTEMPTS) {
      return {
        blocked: true,
        attempts,
      };
    }

    return {
      blocked: false,
      attempts,
    };
  } finally {
    await redisClient.quit();
  }
};
module.exports = { initRedisClient, generateUserId, generateBusinessId, loginRateLimiter,getFailedRegistration, generateUId, storeFailedRegistration,generateUBId, cacheUser, checkUserInCache };
