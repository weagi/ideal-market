const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'https://your-web-domain.com'],
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 解析JSON和表单数据
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 文件上传配置
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB限制
});

// 路由导入
const ideaRoutes = require('./routes/ideas');
const userRoutes = require('./routes/users');

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '灵感集市后端服务',
    version: '1.0.0',
    status: 'running'
  });
});

// API路由
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/users', userRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口未找到' });
});

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ideal_market');
    console.log('✅ MongoDB连接成功');
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 灵感集市后端服务启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
  });
};

// 处理优雅关闭
process.on('SIGTERM', () => {
  console.log('👋 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

startServer().catch(console.error);