// 健康检查脚本
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ideal_market');
    console.log('✅ Database health check passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    process.exit(1);
  }
}

// 执行健康检查
checkDatabase();