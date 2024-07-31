/* const redis = require('redis');

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

module.exports = { initRedisClient };
 */

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

/* const generateUserId = async () => {
  const redisClient = await initRedisClient();

  const multi = redisClient.multi();
  multi.incr('userIdCounter');
  const [counter] = await multi.exec();
  
  if (counter === null) {
    throw new Error('Failed to increment counter');
  }
  
  const paddedCounter = String(counter).padStart(5, '0');
  const date = moment().format('YYYYMMDD');
  const time = moment().format('HHmmss');
  const userId = `T${paddedCounter}-${date}-${time}`;
  
  return userId;
}; */
const generateUserId = async () => {
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


module.exports = { initRedisClient, generateUserId };
