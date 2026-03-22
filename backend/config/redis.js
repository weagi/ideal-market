// Redis配置
const redis = require('redis');
require('dotenv').config();

const createRedisClient = () => {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('✅ Redis连接成功'));
  
  return client;
};

module.exports = createRedisClient;