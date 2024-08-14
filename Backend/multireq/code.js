const redis = require('redis');

// Initialize Redis client
const initRedisClient = async () => {
  const client = redis.createClient({
    socket: {
      port: 6379,
      host: '127.0.0.1',
    }
  });

  await client.connect();

  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  client.on('end', () => {
    console.log('Redis client disconnected');
  });

  return client;
};

/* (async () => {
  const client = await initRedisClient();

  // Set a value for the userId
  const count1 = await client.sendCommand(['RPUSH', 'userIds', 'userId1']);
  console.log('Count after first push:', count1);

  // Set another value for the userId (duplicate)
  const count2 = await client.sendCommand(['RPUSH', 'userIds', 'userId1']);
  console.log('Count after second push:', count2);

  const count3 = await client.sendCommand(['RPUSH', 'userIds', 'userId1']);
  console.log('Count after second push:', count3);

  const count4 = await client.sendCommand(['RPUSH', 'userIds', 'userId1']);
  console.log('Count after second push:', count4);

  // Get all userIds
  const userIds = await client.sendCommand(['LRANGE', 'userIds', '0', '-1']);
  console.log('User IDs:', userIds);

  // Close Redis connection
  await client.quit();
})(); */
const moment = require('moment');

const generateId = async (keyPrefix, businessId = '') => {
  const redisClient = await initRedisClient();

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

(async () => {
  // Generate a new user ID
  const newUserId = await generateUserId('B-T00042-20240801-131433');
  console.log('Generated User ID:', newUserId);

  // Cache a user
  const user = { username: 'abc', email: 'abc@example.com' };
  await cacheUser(user);

  // Check if a user is in cache
  const cachedUser = await checkUserInCache('abc');
  console.log('Cached User:', cachedUser);

  // Initialize Redis client for other operations
  const client = await initRedisClient();

  /* // Set some values for the userId
  const count1 = await client.sendCommand(['LPUSH', 'userIds', newUserId]);
  console.log('Count after first push:', count1);

  // Get all userIds
  const userIds = await client.sendCommand(['LRANGE', 'userIds', '0', '-1']);
  console.log('User IDs:', userIds); */
  // Set multiple cache keys with a TTL of 30 seconds
  await client.sendCommand(['SETEX', 'user:123:profile', 30, JSON.stringify({ name: 'abc', email: 'abc@example.com' })]);
  await client.sendCommand(['SETEX', 'user:456:profile', 30, JSON.stringify({ name: 'abc', email: 'abc@example.com' })]);

  // Refresh multiple cache keys after 20 seconds
  setTimeout(async () => {
    try {
      const data = await client.sendCommand(['MGET', 'user:123:profile', 'user:456:profile']);
      const userData = data.map((item) => item ? JSON.parse(item) : null);

      userData.forEach((user) => {
        if (user) user.updated = true;
      });

      await client.sendCommand(['MSET', 
        'user:123:profile', JSON.stringify(userData[0]),
        'user:456:profile', JSON.stringify(userData[1])
      ]);
    } catch (err) {
      console.error('Error refreshing cache:', err);
    }
  }, 20000);

  // Close Redis connection
  await client.quit();
})();



