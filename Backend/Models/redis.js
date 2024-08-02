
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

  try {
    const counterKey = businessId ? `${businessId}:${keyPrefix}IdCounter` : `${keyPrefix}IdCounter`;
    const counter = await redisClient.incr(counterKey);

    if (counter === null) {
      throw new Error('Failed to increment counter');
    }

    const paddedCounter = String(counter).padStart(5, '0');
    const date = moment().format('YYYYMMDD');
    const time = moment().format('HHmmss');
    const id = `${keyPrefix}-T${paddedCounter}-${date}-${time}`;

    return id;
  } finally {
    await redisClient.quit();
  }
};

const generateUserId = async (businessId) => generateId('U', businessId);
const generateBusinessId = async () => generateId('B');
const generateUBId = async () => generateId('UB');

module.exports = { initRedisClient, generateUserId, generateBusinessId, generateUBId };


