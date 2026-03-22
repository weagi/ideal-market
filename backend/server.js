const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

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
const wechatRoutes = require('./routes/wechat');

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
app.use('/api/v1/wechat', wechatRoutes);

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

// 启动服务器
const startServer = async () => {
  // 连接数据库（如果配置了的话）
  if (process.env.MONGODB_URI) {
    const connectDB = require('./config/db');
    await connectDB();
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 灵感集市后端服务启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📱 微信公众号OAuth回调: http://localhost:${PORT}/api/v1/wechat/oauth/callback`);
    console.log(`📱 微信JS-SDK配置: http://localhost:${PORT}/api/v1/wechat/js-config`);
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